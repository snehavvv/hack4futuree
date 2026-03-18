"""
Authentication router & JWT validation dependency.

Validates Supabase-issued JWTs using the shared HS256 secret.
Provides a `get_current_user` dependency that extracts the user UUID
from the Authorization header for use in protected route handlers.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings
from app.database import get_pool
from app.models.schemas import ProfileOut, ProfileUpdate, TokenPayload
from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# FastAPI security scheme — expects "Bearer <token>" header
_bearer_scheme = HTTPBearer()


# ── JWT validation dependency ─────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> UUID:
    """
    Validate the Supabase JWT and return the authenticated user's UUID.

    Raise 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        token_data = TokenPayload(**payload)
        return token_data.sub
    except JWTError as exc:
        logger.warning("JWT validation failed", extra={"error": str(exc)})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=ProfileOut)
async def get_my_profile(user_id: UUID = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM public.profiles WHERE id = $1",
            user_id,
        )
    if row is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return dict(row)


@router.patch("/me", response_model=ProfileOut)
async def update_my_profile(
    body: ProfileUpdate,
    user_id: UUID = Depends(get_current_user),
):
    """Update the authenticated user's profile fields."""
    pool = get_pool()

    updates: dict = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clauses = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(updates))
    values = list(updates.values())

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            f"UPDATE public.profiles SET {set_clauses} WHERE id = $1 RETURNING *",
            user_id,
            *values,
        )
    if row is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return dict(row)
