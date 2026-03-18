"""
SquintScale FastAPI application entry point.

- CORS middleware configured from env
- Versioned API prefix: /api/v1
- Lifespan events for DB pool management
- Health check with DB + Tesseract diagnostics
"""

from __future__ import annotations

import subprocess
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import check_db_connection, connect_db, disconnect_db
from app.models.schemas import HealthResponse
from app.routers import analyses, auth, reports, user
from app.utils.logging import get_logger, setup_logging
from app.utils.supabase import supabase_client
from app.database import get_pool

# Initialise logging first
setup_logging()
logger = get_logger(__name__)


from app.services.job_queue import init_job_queue, shutdown_job_queue


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info(
        "Starting SquintScale backend",
        extra={"environment": settings.environment},
    )
    await connect_db()
    
    # 1. PostgreSQL Check
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
    except Exception as e:
        logger.error(f"Startup check failed: PostgreSQL connection error via DATABASE_URL: {e}")
        raise RuntimeError(f"Database unavailable: {e}")

    # 2. Tesseract Check
    try:
        subprocess.run(["tesseract", "--version"], capture_output=True, check=True)
    except FileNotFoundError:
        logger.error("Startup check failed: tesseract-ocr is not installed or not in PATH.")
        raise RuntimeError("Tesseract unavailable")
    except Exception as e:
        logger.error(f"Startup check failed: Tesseract execution error: {e}")
        raise RuntimeError(f"Tesseract error: {e}")

    # 3. Storage bucket Check
    try:
        buckets = supabase_client.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        if settings.storage_bucket not in bucket_names:
            logger.error(f"Startup check failed: Storage bucket '{settings.storage_bucket}' does not exist. Checked buckets: {bucket_names}")
            raise RuntimeError(f"Storage bucket '{settings.storage_bucket}' missing")
    except Exception as e:
        logger.error(f"Startup check failed: Could not fetch Storage buckets from Supabase: {e}")
        raise RuntimeError(f"Supabase storage error: {e}")
        
    init_job_queue(max_workers=4)
    yield
    shutdown_job_queue()
    await disconnect_db()
    logger.info("SquintScale backend shut down")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SquintScale API",
    description="Accessibility scoring engine for visual content",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the configured frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount versioned routers
API_V1 = "/api/v1"
app.include_router(auth.router, prefix=f"{API_V1}")
app.include_router(user.router, prefix=f"{API_V1}")
app.include_router(analyses.router, prefix=f"{API_V1}")
app.include_router(reports.router, prefix=f"{API_V1}")


# ── Health check ──────────────────────────────────────────────────────────────

def _check_tesseract() -> str:
    """Return 'available' if Tesseract CLI is installed, else 'unavailable'."""
    try:
        result = subprocess.run(
            ["tesseract", "--version"],
            capture_output=True,
            timeout=5,
        )
        return "available" if result.returncode == 0 else "unavailable"
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return "unavailable"


@app.get(
    f"{API_V1}/health",
    response_model=HealthResponse,
    tags=["health"],
    summary="Service health check",
)
async def health_check():
    """
    Returns service status including database connectivity
    and Tesseract OCR availability.
    """
    db_status = "connected" if await check_db_connection() else "error"
    tesseract_status = _check_tesseract()

    return HealthResponse(
        status="ok",
        version="1.0.0",
        db=db_status,
        tesseract=tesseract_status,
    )
