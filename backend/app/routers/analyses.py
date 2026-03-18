"""
Analyses router — CRUD for analysis jobs, metrics, and suggestions.
Implements the image upload and analysis creation pipeline.

All endpoints require a valid Supabase JWT (via get_current_user).
"""

from __future__ import annotations

import httpx
from io import BytesIO
from typing import List, Optional, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from PIL import Image

from app.database import get_pool
from app.models.schemas import (
    AnalysisUploadResponse,
    AnalysisUrlCreate,
    AnalysisMetricsOut,
    AnalysisOut,
    AnalysisListItem,
    SuggestionOut,
    AnalysisStatusResponse,
    MetricsOut,
    SuggestionItem,
    WCAGIssueItem,
)
from app.routers.auth import get_current_user
from app.services.storage import upload_image_to_storage, delete_image_from_storage, get_signed_url
from app.services.job_queue import enqueue_analysis
from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/analyses", tags=["analyses"])

# Allowed image constraints
ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "image/svg+xml", "application/pdf",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MIN_DIMENSION = 50  # 50x50px minimum

VALID_PRESETS = {"presbyopia", "myopia", "bright_sunlight", "dim_lighting", "cataract", "combined"}


def _validate_image_dimensions(image_bytes: bytes, content_type: str) -> None:
    """Validate image is at least MIN_DIMENSION x MIN_DIMENSION pixels."""
    if content_type in ("image/svg+xml", "application/pdf"):
        return  # Skip dimension check for SVG/PDF
    try:
        img = Image.open(BytesIO(image_bytes))
        w, h = img.size
        if w < MIN_DIMENSION or h < MIN_DIMENSION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image too small. Minimum dimensions are {MIN_DIMENSION}x{MIN_DIMENSION}px. Got {w}x{h}px.",
            )
    except HTTPException:
        raise
    except Exception:
        pass  # If PIL can't open it, let the pipeline handle it


@router.post("/upload", response_model=AnalysisUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_analysis(
    file: UploadFile = File(...),
    wcag_level: str = Form("AA"),
    simulation_preset: str = Form("combined"),
    user_id: UUID = Depends(get_current_user),
):
    """
    Accept an image file upload, save it to Supabase Storage,
    and create a new 'queued' analysis job.
    """
    # Validate content type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{content_type}'. Accepted: JPG, PNG, WebP, GIF, SVG, PDF.",
        )

    # Read file content
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB.",
        )

    # Validate dimensions
    _validate_image_dimensions(image_bytes, content_type)

    # Normalize preset
    if simulation_preset not in VALID_PRESETS:
        simulation_preset = "combined"

    # Normalize wcag_level
    wcag_level = wcag_level.upper()
    if wcag_level not in ("AA", "AAA"):
        wcag_level = "AA"

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO public.analyses (user_id, input_type, wcag_level, simulation_preset, status)
            VALUES ($1, 'upload', $2, $3, 'queued')
            RETURNING id
            """,
            user_id,
            wcag_level,
            simulation_preset,
        )
        analysis_id = row["id"]

        try:
            storage_path = await upload_image_to_storage(
                user_id=user_id,
                analysis_id=analysis_id,
                image_bytes=image_bytes,
                content_type=content_type,
            )

            await conn.execute(
                "UPDATE public.analyses SET original_image_path = $1 WHERE id = $2",
                storage_path,
                analysis_id,
            )

            enqueue_analysis(analysis_id, user_id)
            return AnalysisUploadResponse(analysis_id=analysis_id, status="queued")

        except Exception as e:
            logger.error("Upload failed", exc_info=True)
            await conn.execute("DELETE FROM public.analyses WHERE id = $1", analysis_id)
            raise HTTPException(status_code=500, detail="Failed to upload image")


@router.post("/url", response_model=AnalysisUploadResponse, status_code=status.HTTP_201_CREATED)
async def url_analysis(
    body: AnalysisUrlCreate,
    user_id: UUID = Depends(get_current_user),
):
    """
    Accept an image URL, download it, save to Supabase Storage,
    and create a new 'queued' analysis job.
    """
    # Validate URL starts with http
    if not body.url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=400,
            detail="URL must start with http:// or https://",
        )

    logger.info(f"Fetching URL: {body.url}")

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(body.url)
            resp.raise_for_status()

            content_type = resp.headers.get("content-type", "").split(";")[0].strip()
            if content_type not in ALLOWED_MIME_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"URL does not point to a supported image. Got content-type: {content_type}",
                )

            image_bytes = resp.content
            if len(image_bytes) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Image too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB.",
                )
    except httpx.HTTPError as he:
        logger.error(f"Failed to fetch URL {body.url}: {str(he)}")
        raise HTTPException(
            status_code=400,
            detail="Could not retrieve the provided URL. Make sure it is public and valid.",
        )

    # Validate dimensions
    _validate_image_dimensions(image_bytes, content_type)

    # Normalize preset
    simulation_preset = body.simulation_preset
    if simulation_preset not in VALID_PRESETS:
        simulation_preset = "combined"

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO public.analyses (user_id, input_type, input_url, wcag_level, simulation_preset, status)
            VALUES ($1, 'url', $2, $3, $4, 'queued')
            RETURNING id
            """,
            user_id,
            body.url,
            body.wcag_level.upper(),
            simulation_preset,
        )
        analysis_id = row["id"]

        try:
            storage_path = await upload_image_to_storage(
                user_id=user_id,
                analysis_id=analysis_id,
                image_bytes=image_bytes,
                content_type=content_type,
            )

            await conn.execute(
                "UPDATE public.analyses SET original_image_path = $1 WHERE id = $2",
                storage_path,
                analysis_id,
            )

            enqueue_analysis(analysis_id, user_id)
            return AnalysisUploadResponse(analysis_id=analysis_id, status="queued")

        except Exception as e:
            logger.error("Upload failed", exc_info=True)
            await conn.execute("DELETE FROM public.analyses WHERE id = $1", analysis_id)
            raise HTTPException(status_code=500, detail="Failed to upload fetched image")


@router.get("/", response_model=List[AnalysisListItem])
async def list_analyses(
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
    user_id: UUID = Depends(get_current_user),
):
    """List paginated analyses for the authenticated user."""
    offset = (max(1, page) - 1) * limit
    pool = get_pool()

    query = "SELECT * FROM public.analyses WHERE user_id = $1"
    args: List[Any] = [user_id]

    if status_filter:
        query += " AND status = $2"
        args.append(status_filter)
        query += " ORDER BY created_at DESC LIMIT $3 OFFSET $4"
        args.extend([limit, offset])
    else:
        query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        args.extend([limit, offset])

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *args)

    results = []
    for r in rows:
        item = dict(r)
        # Map squint_band -> band_label for frontend
        item["band_label"] = item.pop("squint_band", None)
        # Generate signed URL for thumbnail
        if item.get("original_image_path"):
            item["original_image_path"] = get_signed_url(item["original_image_path"])
        results.append(item)

    return results


@router.get("/{analysis_id}", response_model=AnalysisOut)
async def get_analysis(
    analysis_id: UUID,
    user_id: UUID = Depends(get_current_user),
):
    """Retrieve a single analysis by ID with full metrics, suggestions, and signed URLs."""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM public.analyses WHERE id = $1 AND user_id = $2",
            analysis_id,
            user_id,
        )
        if row is None:
            raise HTTPException(status_code=404, detail="Analysis not found")

        result = dict(row)

        # Map squint_band -> band_label
        result["band_label"] = result.pop("squint_band", None)

        # Generate signed URLs
        if result.get("original_image_path"):
            result["original_image_path"] = get_signed_url(result["original_image_path"])
        if result.get("degraded_image_path"):
            result["degraded_image_path"] = get_signed_url(result["degraded_image_path"])

        # Fetch metrics
        metrics_row = await conn.fetchrow(
            "SELECT * FROM public.analysis_metrics WHERE analysis_id = $1",
            analysis_id,
        )
        if metrics_row:
            result["metrics"] = MetricsOut(
                ocr_retention_rate=metrics_row.get("ocr_retention_rate"),
                contrast_score=metrics_row.get("contrast_score"),
                font_size_score=metrics_row.get("font_size_score"),
                visual_clutter_score=metrics_row.get("visual_clutter_score"),
                color_accessibility_score=metrics_row.get("color_accessibility_score"),
                confidence_delta=metrics_row.get("confidence_delta"),
                ocr_text_before=metrics_row.get("ocr_text_before"),
                ocr_text_after=metrics_row.get("ocr_text_after"),
            )

        # Fetch suggestions
        suggestion_rows = await conn.fetch(
            "SELECT * FROM public.suggestions WHERE analysis_id = $1 ORDER BY rank ASC",
            analysis_id,
        )
        if suggestion_rows:
            result["suggestions"] = [
                SuggestionItem(
                    rank=s.get("rank"),
                    severity=s.get("severity"),
                    dimension=s.get("dimension"),
                    suggestion_text=s.get("suggestion_text") or s.get("suggestion"),
                    expected_score_lift=s.get("expected_lift"),
                )
                for s in suggestion_rows
            ]

        # Generate WCAG issues from contrast score
        wcag_issues = []
        if metrics_row:
            contrast = metrics_row.get("contrast_score", 100)
            if contrast is not None and contrast < 75:
                wcag_issues.append(WCAGIssueItem(
                    criterion="1.4.3",
                    severity="fail" if contrast < 50 else "warning",
                    description=f"Contrast score {contrast:.1f}/100 — below WCAG AA threshold",
                ))
        result["wcag_issues"] = wcag_issues

    return result


@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    analysis_id: UUID,
    user_id: UUID = Depends(get_current_user),
):
    """Ultra-fast endpoint purely for frontend polling."""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, status, error_reason FROM public.analyses WHERE id = $1 AND user_id = $2",
            analysis_id,
            user_id,
        )
    if row is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return AnalysisStatusResponse(
        analysis_id=row["id"],
        status=row["status"],
        error_reason=row["error_reason"],
    )


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: UUID,
    user_id: UUID = Depends(get_current_user),
):
    """Delete an analysis and associated storage files."""
    pool = get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM public.analyses WHERE id = $1 AND user_id = $2",
            analysis_id,
            user_id,
        )
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Analysis not found")

    try:
        await delete_image_from_storage(user_id, analysis_id)
    except Exception as e:
        logger.warning(f"Failed to delete storage files for analysis {analysis_id}", exc_info=True)


@router.get("/{analysis_id}/metrics", response_model=AnalysisMetricsOut)
async def get_analysis_metrics(
    analysis_id: UUID,
    user_id: UUID = Depends(get_current_user),
):
    """Return detailed metrics for a completed analysis."""
    pool = get_pool()
    async with pool.acquire() as conn:
        analysis = await conn.fetchrow(
            "SELECT id FROM public.analyses WHERE id = $1 AND user_id = $2",
            analysis_id,
            user_id,
        )
        if analysis is None:
            raise HTTPException(status_code=404, detail="Analysis not found")

        row = await conn.fetchrow(
            "SELECT * FROM public.analysis_metrics WHERE analysis_id = $1",
            analysis_id,
        )
    if row is None:
        raise HTTPException(status_code=404, detail="Metrics not yet available")
    return dict(row)


@router.get("/{analysis_id}/suggestions", response_model=List[SuggestionOut])
async def get_analysis_suggestions(
    analysis_id: UUID,
    user_id: UUID = Depends(get_current_user),
):
    """Return improvement suggestions for a completed analysis."""
    pool = get_pool()
    async with pool.acquire() as conn:
        analysis = await conn.fetchrow(
            "SELECT id FROM public.analyses WHERE id = $1 AND user_id = $2",
            analysis_id,
            user_id,
        )
        if analysis is None:
            raise HTTPException(status_code=404, detail="Analysis not found")

        rows = await conn.fetch(
            "SELECT * FROM public.suggestions WHERE analysis_id = $1 ORDER BY rank ASC",
            analysis_id,
        )
    return [dict(r) for r in rows]
