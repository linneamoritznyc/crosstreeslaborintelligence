"""Extraherar historisk jobbannonsdata från Jobtech Historical API.

Endpunkt: GET /search?published-after=<datum>&published-before=<datum>&limit=<n>
Används av trends-sync för att beräkna IDF-vikter på kompetenser.
"""
from __future__ import annotations

import os

import httpx

from .._shared.http import request_with_retry
from .._shared.logging import get_logger

log = get_logger(__name__)

_BASE = os.environ.get(
    "AF_HISTORICAL_URL", "https://historical.api.jobtechdev.se"
)
_PAGE_SIZE = 500


async def extract_historical(year: int) -> list[dict]:
    """Hämtar upp till _PAGE_SIZE annonser för ett kalenderår."""
    params = {
        "published-after": f"{year}-01-01",
        "published-before": f"{year}-12-31",
        "limit": _PAGE_SIZE,
    }
    async with httpx.AsyncClient(timeout=120) as client:
        try:
            response = await request_with_retry(
                client, "GET", f"{_BASE}/search", params=params
            )
        except Exception as exc:
            log.error("historical.extract.failed", year=year, fel=str(exc))
            return []
    hits: list[dict] = response.json().get("hits", [])
    log.info("historical.extract", year=year, count=len(hits))
    return hits
