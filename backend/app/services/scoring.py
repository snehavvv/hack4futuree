"""
Squint Score engine.
Calculates visual accessibility metrics and a final weighted Squint Score.
"""

from __future__ import annotations

import cv2
import numpy as np
import pytesseract
from skimage.metrics import structural_similarity as ssim

from app.services.simulation import apply_color_deficiency
from app.utils.logging import get_logger

logger = get_logger(__name__)


def compute_contrast_score(image: np.ndarray, wcag_level: str = "AA") -> float:
    """
    Estimate WCAG contrast ratio by sampling foreground/background regions using edge detection.
    Returns normalized score 0-100.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel = lab[:, :, 0]

    edges = cv2.Canny(gray, 50, 150)
    kernel = np.ones((3, 3), np.uint8)
    fg_mask = cv2.dilate(edges, kernel, iterations=1)
    bg_mask = cv2.bitwise_not(cv2.dilate(edges, kernel, iterations=3))

    if cv2.countNonZero(fg_mask) == 0 or cv2.countNonZero(bg_mask) == 0:
        return 50.0

    fg_median = np.median(l_channel[fg_mask > 0])
    bg_median = np.median(l_channel[bg_mask > 0])

    l1 = max(fg_median, bg_median) / 255.0
    l2 = min(fg_median, bg_median) / 255.0

    ratio = (l1 + 0.05) / (l2 + 0.05)

    # Map per spec
    if ratio >= 7.0:
        return 100.0
    elif ratio >= 4.5:
        return 75.0
    elif ratio >= 3.0:
        return 50.0
    else:
        # Proportional below 50
        return max(0.0, (ratio / 3.0) * 50.0)


def compute_font_size_score(image: np.ndarray) -> float:
    """
    Estimate average font size using pytesseract bounding boxes.
    Assumes 96 DPI — converts px to pt (px * 72 / 96).
    Returns normalized score 0-100.
    """
    try:
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    except Exception as e:
        logger.warning(f"Font size OCR failed: {e}")
        return 50.0

    heights = []
    for i, word in enumerate(data['text']):
        if word.strip():
            h = data['height'][i]
            heights.append(h)

    if not heights:
        return 50.0

    avg_height_px = float(np.mean(heights))
    avg_pt = avg_height_px * 72.0 / 96.0  # Convert px to pt at 96 DPI

    # Score per spec
    if avg_pt >= 16.0:
        return 100.0
    elif avg_pt >= 12.0:
        return 70.0
    elif avg_pt >= 10.0:
        return 45.0
    else:
        return 20.0


def compute_visual_clutter_score(image: np.ndarray) -> float:
    """
    Compute edge density representing visual clutter.
    Higher edge density = more clutter = lower score.
    Returns normalized score 0-100.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    edge_density = float(np.sum(edges > 0)) / float(gray.shape[0] * gray.shape[1])

    # Score per spec
    if edge_density < 0.05:
        return 100.0
    elif edge_density < 0.15:
        return 75.0
    elif edge_density < 0.25:
        return 50.0
    else:
        # Proportional below 50
        return max(0.0, 50.0 * (1.0 - (edge_density - 0.25) / 0.25))


def compute_color_accessibility_score(image: np.ndarray) -> float:
    """
    Check distinguishability under deuteranopia simulation using SSIM.
    Returns normalized score 0-100.
    """
    simulated = apply_color_deficiency(image, deficiency_type="deuteranopia")

    gray_orig = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray_sim = cv2.cvtColor(simulated, cv2.COLOR_BGR2GRAY)

    win_size = min(7, min(gray_orig.shape) // 2)
    if win_size % 2 == 0:
        win_size -= 1
    if win_size < 3:
        win_size = 3

    score_val, _ = ssim(gray_orig, gray_sim, full=True, win_size=win_size, data_range=255)

    # Score per spec
    ssim_val = max(0.0, float(score_val))
    if ssim_val >= 0.9:
        return 100.0
    elif ssim_val >= 0.7:
        return 70.0
    elif ssim_val >= 0.5:
        return 45.0
    else:
        return 20.0


def compute_squint_score(metrics: dict) -> tuple[float, str]:
    """
    Calculate final Squint Score (0-100) and Band Label.

    Weights per spec:
    - OCR Retention: 30%
    - Contrast: 25%
    - Font Size: 20%
    - Visual Clutter: 15%
    - Color Accessibility: 10%
    """
    retention = metrics.get('ocr_retention_rate', 0.0)
    # Handle fraction vs percentage
    if retention <= 1.0 and retention > 0.001:
        retention *= 100.0

    contrast = metrics.get('contrast_score', 0.0)
    font_size = metrics.get('font_size_score', 0.0)
    clutter = metrics.get('visual_clutter_score', 0.0)
    color = metrics.get('color_accessibility_score', 0.0)

    raw_score = (
        (retention * 0.30) +
        (contrast * 0.25) +
        (font_size * 0.20) +
        (clutter * 0.15) +
        (color * 0.10)
    )

    score = round(float(raw_score), 1)

    # Band labels per spec
    if score >= 90.0:
        band = "excellent"
    elif score >= 70.0:
        band = "good"
    elif score >= 50.0:
        band = "moderate"
    elif score >= 30.0:
        band = "poor"
    else:
        band = "critical"

    return score, band
