"""
Simple in-process async job queue using ThreadPoolExecutor.

Allows FastAPI to offload CPU-bound or blocking vision simulations securely 
without requiring external dependencies like Redis/Celery for MVP.
"""

from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from uuid import UUID

from app.database import get_pool
from app.services.analysis_service import run_full_analysis
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Global executor instance. Will be initialized on FastAPI startup.
_executor: ThreadPoolExecutor | None = None


def init_job_queue(max_workers: int = 4) -> None:
    """Initialize the global thread pool executor."""
    global _executor
    if _executor is None:
        _executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="SquintWorker")
        logger.info(f"Initialized Job Queue ThreadPoolExecutor with {max_workers} workers.")


def shutdown_job_queue() -> None:
    """Gracefully safely shutdown the executor, waiting for running jobs to finish."""
    global _executor
    if _executor is not None:
        logger.info("Shutting down Job Queue ThreadPoolExecutor...")
        _executor.shutdown(wait=True)
        _executor = None
        logger.info("Job Queue stopped.")


def enqueue_analysis(analysis_id: UUID, user_id: UUID) -> None:
    """
    Fire-and-forget submission of the analysis pipeline.
    Runs non-blocking in the background thread pool.
    """
    if _executor is None:
        logger.error("Job Queue is not initialized! Cannot enqueue analysis.")
        return

    # Submit to the thread pool
    # run_full_analysis is an async function, so we need to run it in a new event loop inside the thread,
    # or wrap it in asyncio.run.
    _executor.submit(_run_analysis_sync_wrapper, analysis_id, user_id)
    logger.info(f"Enqueued analysis job {analysis_id} for user {user_id}.")


def _run_analysis_sync_wrapper(analysis_id: UUID, user_id: UUID) -> None:
    """
    Synchronous wrapper to run the async `run_full_analysis` in a background thread.
    Catches ALL unhandled exceptions and writes a 'failed' status to the DB.
    """
    try:
        logger.info(f"Thread starting background analysis {analysis_id}...")
        asyncio.run(run_full_analysis(analysis_id, user_id))
    except Exception as e:
        logger.error(f"FATAL Exception in background thread for {analysis_id}: {str(e)}", exc_info=True)
        # Attempt to mark the database specifically as failed since the orchestrator crashed completely
        try:
            asyncio.run(_mark_job_failed(analysis_id, str(e)))
        except Exception as inner_e:
            logger.error(f"Failed to write fatal error state to DB for {analysis_id}: {str(inner_e)}")


async def _mark_job_failed(analysis_id: UUID, reason: str) -> None:
    """Async helper to explicitly force a failure state onto an analysis if the thread crashes."""
    pool = get_pool()
    error_msg = str(reason)
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE public.analyses SET status = 'failed', error_reason = $1 WHERE id = $2",
            error_msg[:255],
            analysis_id,
        )
