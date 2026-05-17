"""Delad HTTP-klient för AF-API:er: circuit breaker + exponential backoff.

Mönstret speglar data-pipeline/_shared/http.py men använder httpx.AsyncClient
som skapas inline (tjänsterna hanterar sina egna klientar).
"""
from __future__ import annotations

import random
from typing import Any

import httpx
import pybreaker

from ..middleware.logging import get_logger

log = get_logger(__name__)

# Samma parametrar som health-endpointens _AF_BREAKER och data-pipelinens
# af_breaker — ett konsekvent beteende oavsett vilken tjänst som anropar AF.
af_breaker = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=60, name="af_api")

MAX_RETRIES = 5


async def af_request(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    **kwargs: Any,
) -> httpx.Response:
    """Anropar AF-API med circuit breaker och exponentiell backoff."""
    last_exc: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            response: httpx.Response = await af_breaker.call_async(
                client.request, method, url, **kwargs
            )
            response.raise_for_status()
            return response
        except pybreaker.CircuitBreakerError as exc:
            log.error("af_http.circuit_open", url=url, attempt=attempt)
            raise
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code < 500:
                raise
            last_exc = exc
        except Exception as exc:
            last_exc = exc

        if attempt < MAX_RETRIES - 1:
            delay = 2**attempt + random.uniform(0, 1)
            log.warning(
                "af_http.retry",
                url=url,
                attempt=attempt,
                delay=round(delay, 2),
            )
            import asyncio
            await asyncio.sleep(delay)

    raise last_exc or RuntimeError(f"af_request misslyckades efter {MAX_RETRIES} försök")
