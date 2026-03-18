"""
Pydantic schemas for API request/response models.

These are pure data-transfer objects — no database coupling.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    db: str = Field(description="'connected' or 'error'")
    tesseract: str = Field(description="'available' or 'unavailable'")


# ── Profiles ──────────────────────────────────────────────────────────────────

class ProfileOut(BaseModel):
    id: UUID
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    account_tier: str = "free"
    created_at: datetime
    updated_at: datetime


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


# ── Analyses ──────────────────────────────────────────────────────────────────

class AnalysisUploadResponse(BaseModel):
    analysis_id: UUID
    status: str = "queued"


class AnalysisStatusResponse(BaseModel):
    analysis_id: UUID
    status: str
    error_reason: Optional[str] = None


class AnalysisUrlCreate(BaseModel):
    url: str
    wcag_level: str = Field(default="AA", pattern=r"^(AA|AAA)$")
    simulation_preset: str = Field(default="combined")


class MetricsOut(BaseModel):
    ocr_retention_rate: Optional[float] = None
    contrast_score: Optional[float] = None
    font_size_score: Optional[float] = None
    visual_clutter_score: Optional[float] = None
    color_accessibility_score: Optional[float] = None
    confidence_delta: Optional[float] = None
    ocr_text_before: Optional[str] = None
    ocr_text_after: Optional[str] = None


class SuggestionItem(BaseModel):
    rank: Optional[int] = None
    severity: Optional[str] = None
    dimension: Optional[str] = None
    suggestion_text: Optional[str] = None
    expected_score_lift: Optional[float] = None


class WCAGIssueItem(BaseModel):
    criterion: str
    severity: str
    description: str


class AnalysisOut(BaseModel):
    id: UUID
    user_id: UUID
    input_type: Optional[str] = None
    input_url: Optional[str] = None
    original_image_path: Optional[str] = None
    degraded_image_path: Optional[str] = None
    status: str = "queued"
    error_reason: Optional[str] = None
    squint_score: Optional[float] = None
    band_label: Optional[str] = None
    wcag_level: str = "AA"
    simulation_preset: str = "combined"
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Nested data (populated by the detail endpoint)
    metrics: Optional[MetricsOut] = None
    suggestions: Optional[List[SuggestionItem]] = None
    wcag_issues: Optional[List[WCAGIssueItem]] = None


class AnalysisListItem(BaseModel):
    id: UUID
    user_id: UUID
    input_type: Optional[str] = None
    input_url: Optional[str] = None
    original_image_path: Optional[str] = None
    status: str = "queued"
    squint_score: Optional[float] = None
    band_label: Optional[str] = None
    simulation_preset: str = "combined"
    created_at: datetime


class AnalysisMetricsOut(BaseModel):
    id: Optional[UUID] = None
    analysis_id: UUID
    ocr_retention_rate: Optional[float] = None
    contrast_score: Optional[float] = None
    font_size_score: Optional[float] = None
    visual_clutter_score: Optional[float] = None
    color_accessibility_score: Optional[float] = None
    ocr_text_before: Optional[str] = None
    ocr_text_after: Optional[str] = None
    ocr_confidence_delta: Optional[float] = None
    created_at: Optional[datetime] = None


# ── Suggestions ───────────────────────────────────────────────────────────────

class SuggestionOut(BaseModel):
    id: UUID
    analysis_id: UUID
    severity: Optional[str] = None
    dimension: Optional[str] = None
    suggestion: Optional[str] = None
    suggestion_text: Optional[str] = None
    expected_lift: Optional[float] = None
    rank: Optional[int] = None
    created_at: Optional[datetime] = None


# ── Reports ───────────────────────────────────────────────────────────────────

class ReportCreate(BaseModel):
    analysis_id: UUID


class ReportOut(BaseModel):
    id: UUID
    analysis_id: UUID
    user_id: UUID
    report_url: Optional[str] = None
    created_at: datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class TokenPayload(BaseModel):
    """Decoded JWT payload from Supabase."""
    sub: UUID
    role: str = "authenticated"
    aud: str = "authenticated"
    exp: int
    iat: int
