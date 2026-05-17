"""HTTP-klient med exponentiell backoff, jitter och circuit breaker."""
from __future__ import annotations

import asyncio
import random
from typing import Any

import httpx
import pybreaker

from .logging import get_logger

log = get_logger(__name__)

# Brytaren öppnas efter 5 fel inom 60 s — skyddar AF-API:erna och oss själva.
af_breaker = pybreaker.CircuitBreaker(
    fail_max=5,
    reset_timeout=60,
    name="af_api",
)

MAX_RETRIES = 5


async def request_with_retry(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    **kwargs: Any,
) -> httpx.Response:
    """HTTP-anrop med exponentiell backoff + jitter. Höjer sista fel om alla försök misslyckas.

    Formel: delay = 2**attempt + random.uniform(0, 1) sekunder.
    Circuit breaker stoppar fortsatta anrop när AF-API:erna är nere.
    """
    last_exc: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            response = await af_breaker.call_async(
                client.request, method, url, **kwargs
            )
            response.raise_for_status()
            return response
        except (httpx.HTTPError, pybreaker.CircuitBreakerError) as exc:
            last_exc = exc
            delay = (2 ** attempt) + random.uniform(0, 1)
            log.warning(
                "http.retry",
                method=method,
                url=url,
                attempt=attempt + 1,
                delay_s=round(delay, 2),
                fel=str(exc),
            )
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(delay)

    log.error(
        "http.failed_all_retries",
        method=method,
        url=url,
        attempts=MAX_RETRIES,
        fel=str(last_exc),
    )
    assert last_exc is not None
    raise last_exc
