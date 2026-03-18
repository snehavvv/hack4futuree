"""
Structured JSON logging configuration for SquintScale.

Sets up Python's logging module to output JSON-formatted log records,
making logs parseable by log aggregation tools.
"""

from __future__ import annotations

import logging
import sys

from pythonjsonlogger import json as json_logger

from app.config import settings

_CONFIGURED = False


def setup_logging() -> None:
    """Initialise root logger with JSON formatter. Safe to call multiple times."""
    global _CONFIGURED
    if _CONFIGURED:
        return

    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # JSON formatter
    formatter = json_logger.JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        rename_fields={"asctime": "timestamp", "levelname": "level", "name": "logger"},
    )

    # Stream handler → stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Root logger
    root = logging.getLogger()
    root.setLevel(log_level)
    root.handlers.clear()
    root.addHandler(handler)

    # Quiet noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("asyncpg").setLevel(logging.WARNING)

    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    """Return a named logger (auto-configures if needed)."""
    setup_logging()
    return logging.getLogger(name)
