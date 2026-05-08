"""
Simple in-process async job queue using ThreadPoolExecutor.

Allows FastAPI to offload CPU-bound or blocking vision simulations securely 
without requiring external dependencies like Redis/Celery for MVP.
"""

from __future__ import annotations

from fastapi import BackgroundTasks
from uuid import UUID

from app.services.analysis_service import run_full_analysis
from app.utils.logging import get_logger

logger = get_logger(__name__)


def enqueue_analysis(analysis_id: UUID, user_id: UUID, background_tasks: BackgroundTasks) -> None:
    """
    Enqueues the analysis using FastAPI's BackgroundTasks.
    """
    background_tasks.add_task(run_full_analysis, analysis_id, user_id)
    logger.info(f"Enqueued analysis job {analysis_id} for user {user_id} via BackgroundTasks.")


def init_job_queue(max_workers: int = 4) -> None:
    """No-op now that we use BackgroundTasks, but kept for API compatibility."""
    logger.info("BackgroundTasks initialized (native FastAPI).")


def shutdown_job_queue() -> None:
    """No-op now that we use BackgroundTasks."""
    logger.info("BackgroundTasks shutdown (native FastAPI).")
