"""
Async PostgreSQL connection pool using asyncpg.

Provides startup/shutdown lifecycle hooks and a dependency for
acquiring a connection from the pool in route handlers.
"""

from __future__ import annotations

import asyncpg
from asyncpg import Pool

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Module-level pool reference managed by lifespan events
_pool: Pool | None = None


async def connect_db() -> None:
    """Create the asyncpg connection pool. Call during app startup."""
    global _pool
    try:
        _pool = await asyncpg.create_pool(
            dsn=settings.database_url,
            min_size=2,
            max_size=10,
            command_timeout=30,
        )
        logger.info("Database connection pool created")
    except Exception as exc:
        logger.error("Failed to create database pool", extra={"error": str(exc)})
        raise


async def disconnect_db() -> None:
    """Close the asyncpg connection pool. Call during app shutdown."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("Database connection pool closed")


def get_pool() -> Pool:
    """Return the current connection pool (raises if not initialised)."""
    if _pool is None:
        raise RuntimeError("Database pool is not initialised. Was connect_db() called?")
    return _pool


async def check_db_connection() -> bool:
    """Quick health-check: try to execute a trivial query."""
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return True
    except Exception as exc:
        logger.warning("Database health check failed", extra={"error": str(exc)})
        return False
