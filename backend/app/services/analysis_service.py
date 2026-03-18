"""
Analysis service orchestrator — real end-to-end pipeline.

Steps: Download → Pre-process → OCR (original) → Simulate → OCR (degraded)
       → Score → Suggest → Persist → Complete
"""

from __future__ import annotations

import asyncio
import difflib
from uuid import UUID

import cv2
import numpy as np
import pytesseract

from app.database import get_pool
from app.services.image_utils import load_image_from_bytes, image_to_bytes
from app.services.scoring import (
    compute_contrast_score,
    compute_font_size_score,
    compute_visual_clutter_score,
    compute_color_accessibility_score,
    compute_squint_score,
)
from app.services.simulation import apply_squint_simulation
from app.services.storage import download_image_from_storage, upload_degraded_image
from app.services.suggestions import generate_suggestions
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Simulation preset parameter configurations
SIMULATION_PRESETS = {
    "presbyopia":      {"blur_sigma": 4.0, "contrast_factor": 0.6, "glare_intensity": 0.15, "noise_std": 8.0},
    "myopia":          {"blur_sigma": 6.0, "contrast_factor": 0.8, "glare_intensity": 0.0, "noise_std": 5.0},
    "bright_sunlight": {"blur_sigma": 1.5, "contrast_factor": 0.4, "glare_intensity": 0.6, "noise_std": 5.0},
    "dim_lighting":    {"blur_sigma": 2.0, "contrast_factor": 0.35, "glare_intensity": 0.0, "noise_std": 20.0},
    "cataract":        {"blur_sigma": 5.0, "contrast_factor": 0.45, "glare_intensity": 0.4, "noise_std": 15.0},
    "combined":        {"blur_sigma": 3.0, "contrast_factor": 0.5, "glare_intensity": 0.2, "noise_std": 10.0},
}


def _resize_image(image: np.ndarray, max_dim: int = 1920) -> np.ndarray:
    """Resize image so longest side is at most max_dim, preserving aspect ratio."""
    h, w = image.shape[:2]
    if max(h, w) <= max_dim:
        return image
    scale = max_dim / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def _run_ocr(image: np.ndarray) -> dict:
    """
    Run Tesseract OCR on an image and return extracted data.
    Returns dict with: text, word_count, char_count, avg_confidence, word_boxes
    """
    # Convert to grayscale and apply mild unsharp mask
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (0, 0), 1.0)
    sharpened = cv2.addWeighted(gray, 1.5, blurred, -0.5, 0)

    try:
        data = pytesseract.image_to_data(sharpened, output_type=pytesseract.Output.DICT)
    except Exception as e:
        logger.warning(f"Tesseract OCR failed: {e}")
        return {
            "text": "",
            "word_count": 0,
            "char_count": 0,
            "avg_confidence": 0.0,
            "word_boxes": [],
        }

    words = []
    confidences = []
    boxes = []

    for i, word in enumerate(data["text"]):
        word = word.strip()
        if word and data["conf"][i] > 0:
            words.append(word)
            confidences.append(float(data["conf"][i]))
            boxes.append({
                "word": word,
                "x": data["left"][i],
                "y": data["top"][i],
                "w": data["width"][i],
                "h": data["height"][i],
                "conf": float(data["conf"][i]),
            })

    full_text = " ".join(words)
    avg_conf = float(np.mean(confidences)) if confidences else 0.0

    return {
        "text": full_text,
        "word_count": len(words),
        "char_count": len(full_text),
        "avg_confidence": avg_conf,
        "word_boxes": boxes,
    }


def _compute_delta_metrics(ocr_before: dict, ocr_after: dict) -> dict:
    """Compute retention and delta metrics between original and degraded OCR."""
    # Token retention rate (case-insensitive)
    original_tokens = set(ocr_before["text"].lower().split())
    degraded_tokens = set(ocr_after["text"].lower().split())

    if len(original_tokens) > 0:
        token_retention = len(original_tokens & degraded_tokens) / len(original_tokens)
    else:
        token_retention = 1.0  # No text = nothing to lose

    # Char-level similarity
    char_retention = difflib.SequenceMatcher(
        None, ocr_before["text"].lower(), ocr_after["text"].lower()
    ).ratio()

    # Confidence delta
    confidence_delta = ocr_after["avg_confidence"] - ocr_before["avg_confidence"]

    return {
        "token_retention_rate": round(token_retention, 4),
        "char_retention_rate": round(char_retention, 4),
        "confidence_delta": round(confidence_delta, 2),
    }


async def run_full_analysis(analysis_id: UUID, user_id: UUID | None = None) -> None:
    """
    Background orchestrator for the full analysis pipeline.
    """
    logger.info(f"Analysis job {analysis_id} starting processing.")

    pool = get_pool()

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT user_id, wcag_level, simulation_preset, original_image_path FROM public.analyses WHERE id = $1",
            analysis_id,
        )
        if not row:
            logger.error(f"Analysis {analysis_id} not found in DB.")
            return

        actual_user_id = row["user_id"]
        wcag_level = row["wcag_level"] or "AA"
        simulation_preset = row["simulation_preset"] or "combined"
        original_path = row["original_image_path"]

        await conn.execute(
            "UPDATE public.analyses SET status = 'processing' WHERE id = $1",
            analysis_id,
        )

    try:
        # ══ Step 1 — Pre-processing ══
        logger.info(f"[{analysis_id}] Step 1: Downloading and pre-processing image")
        image_bytes = download_image_from_storage(original_path)
        image = load_image_from_bytes(image_bytes)
        image = _resize_image(image, max_dim=1920)

        # Ensure BGR
        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

        # ══ Step 2 — OCR on original image ══
        logger.info(f"[{analysis_id}] Step 2: Running OCR on original image")
        ocr_before = _run_ocr(image)

        # ══ Step 3 — Squint Simulation ══
        logger.info(f"[{analysis_id}] Step 3: Applying {simulation_preset} simulation")
        preset_params = SIMULATION_PRESETS.get(simulation_preset, SIMULATION_PRESETS["combined"])
        degraded_image = apply_squint_simulation(image, preset_params)

        # Upload degraded image to storage
        degraded_bytes = image_to_bytes(degraded_image, format="PNG")
        degraded_path = await upload_degraded_image(
            user_id=actual_user_id,
            analysis_id=analysis_id,
            image_bytes=degraded_bytes,
        )

        # ══ Step 4 — OCR on degraded image ══
        logger.info(f"[{analysis_id}] Step 4: Running OCR on degraded image")
        ocr_after = _run_ocr(degraded_image)
        deltas = _compute_delta_metrics(ocr_before, ocr_after)

        # ══ Step 5 — Accessibility & Scoring ══
        logger.info(f"[{analysis_id}] Step 5: Computing dimension scores")
        contrast = compute_contrast_score(image, wcag_level)
        font_size = compute_font_size_score(image)
        clutter = compute_visual_clutter_score(image)
        color_access = compute_color_accessibility_score(image)
        ocr_retention_score = deltas["token_retention_rate"] * 100.0

        metrics = {
            "ocr_retention_rate": deltas["token_retention_rate"],
            "contrast_score": contrast,
            "font_size_score": font_size,
            "visual_clutter_score": clutter,
            "color_accessibility_score": color_access,
        }

        score, band = compute_squint_score(metrics)

        # ══ Step 6 — Suggestions ══
        logger.info(f"[{analysis_id}] Step 6: Generating suggestions")
        suggestions = generate_suggestions(metrics, wcag_level)

        # ══ Step 7 — Persist and Complete ══
        logger.info(f"[{analysis_id}] Step 7: Persisting results to database")
        async with pool.acquire() as conn:
            # Insert metrics
            await conn.execute(
                """
                INSERT INTO public.analysis_metrics
                (analysis_id, ocr_retention_rate, contrast_score, font_size_score,
                 visual_clutter_score, color_accessibility_score, confidence_delta,
                 ocr_text_before, ocr_text_after)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """,
                analysis_id,
                metrics["ocr_retention_rate"],
                metrics["contrast_score"],
                metrics["font_size_score"],
                metrics["visual_clutter_score"],
                metrics["color_accessibility_score"],
                deltas["confidence_delta"],
                ocr_before["text"][:10000],   # Truncate long text
                ocr_after["text"][:10000],
            )

            # Insert suggestions
            if suggestions:
                records = [
                    (
                        analysis_id,
                        s["severity"],
                        s.get("suggestion_text", ""),
                        s.get("suggestion_text", ""),  # also store in 'suggestion' column
                        s.get("expected_score_lift", 0.0),
                        s.get("dimension", ""),
                        s.get("rank", i + 1),
                    )
                    for i, s in enumerate(suggestions)
                ]
                await conn.executemany(
                    """
                    INSERT INTO public.suggestions
                    (analysis_id, severity, suggestion_text, suggestion, expected_lift, dimension, rank)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    records,
                )

            # Update root analysis record
            await conn.execute(
                """
                UPDATE public.analyses
                SET status = 'completed',
                    squint_score = $1,
                    squint_band = $2,
                    degraded_image_path = $3
                WHERE id = $4
                """,
                score,
                band,
                degraded_path,
                analysis_id,
            )

        logger.info(
            f"Analysis job {analysis_id} completed with score {score} ({band}) "
            f"and {len(suggestions)} suggestions."
        )

    except Exception as e:
        logger.error(f"Analysis job {analysis_id} failed: {e}", exc_info=True)
        error_msg = str(e)
        async with pool.acquire() as conn:
            await conn.execute(
                "UPDATE public.analyses SET status = 'failed', error_reason = $1 WHERE id = $2",
                error_msg[:255],
                analysis_id,
            )
