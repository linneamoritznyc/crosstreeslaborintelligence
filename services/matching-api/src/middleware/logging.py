import logging
import os
import sys
from typing import Any

import structlog


def setup_logging() -> None:
    """Konfigurerar strukturerad JSON-loggning via structlog.

    Krav från EU AI Act Artikel 12 (automatisk loggning av driftshändelser).
    Loggar skickas till stdout som NDJSON (en JSON-rad per logghändelse) så
    att Railway och nedströmskonsumenter kan parsa dem direkt.
    """
    log_level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    timestamper = structlog.processors.TimeStamper(fmt="iso", utc=True)

    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        timestamper,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    structlog.configure(
        processors=shared_processors + [structlog.processors.JSONRenderer()],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(message)s"))

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(log_level)

    # Tysta bibliotek som annars dubbelloggar utan JSON-format.
    for noisy in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Standardiserad logger-fabrik. Använd modulnamn som `name`."""
    return structlog.get_logger(name)
