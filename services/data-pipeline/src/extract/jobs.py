"""Extraherar jobbannonser från Platsbanken för Jönköpings län (region=06).

Paginerar tills total nås, cachar resultatet i Redis (JOB_SEARCH_SERVE_TTL)
och uppdaterar freshness-stämpel som health-endpointen läser.
"""
from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from typing import Any

import httpx

from .._shared.cache import (
    JOB_SEARCH_SERVE_TTL,
    cache_json,
    set_freshness,
)
from .._shared.http import request_with_retry
from .._shared.logging import get_logger, setup_pipeline_logging

log = get_logger(__name__)

JOBSEARCH_URL = os.environ.get(
    "AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se"
)
JONKOPING_LAN_CODE = os.environ.get("JONKOPING_LAN_CODE", "06")

PAGE_SIZE = 100
# Skydd mot oändlig loop — Platsbanken har sällan över 10 000 träffar per
# regional körning. Vid behov höjs gränsen och vi loggar varning.
MAX_PAGES = 100


async def _fetch_page(
    client: httpx.AsyncClient, offset: int
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "limit": PAGE_SIZE,
        "offset": offset,
        "region": JONKOPING_LAN_CODE,
    }
    response = await request_with_retry(
        client, "POST", f"{JOBSEARCH_URL}/search", json=body
    )
    return response.json()


def _total_value(page: dict[str, Any]) -> int:
    total = page.get("total")
    if isinstance(total, dict):
        value = total.get("value")
        if isinstance(value, int):
            return value
    if isinstance(total, int):
        return total
    return 0


async def fetch_all_jobs() -> list[dict]:
    """Pagineras genom alla träffar för Jönköpings län."""
    hits: list[dict] = []
    async with httpx.AsyncClient(timeout=60) as client:
        first = await _fetch_page(client, 0)
        total = _total_value(first)
        hits.extend(first.get("hits", []))
        log.info(
            "jobs.page", offset=0, count=len(first.get("hits", [])), total=total
        )

        offset = PAGE_SIZE
        page_index = 1
        while offset < total and page_index < MAX_PAGES:
            data = await _fetch_page(client, offset)
            page_hits: list[dict] = data.get("hits", [])
            hits.extend(page_hits)
            log.info(
                "jobs.page",
                offset=offset,
                count=len(page_hits),
                total=total,
                running_total=len(hits),
            )
            if not page_hits:
                break
            offset += PAGE_SIZE
            page_index += 1

        if page_index >= MAX_PAGES and offset < total:
            log.warning(
                "jobs.max_pages_reached",
                page_index=page_index,
                fetched=len(hits),
                total=total,
            )
    return hits


async def fetch_and_cache_jobs() -> list[dict]:
    """Full körning: hämta, cacha och uppdatera freshness."""
    hits = await fetch_all_jobs()
    cache_key = f"jobs:lan:{JONKOPING_LAN_CODE}:all"
    await cache_json(cache_key, hits, JOB_SEARCH_SERVE_TTL)
    await set_freshness("jobs", datetime.now(timezone.utc).isoformat())
    log.info(
        "jobs.cached",
        count=len(hits),
        key=cache_key,
        ttl_seconds=JOB_SEARCH_SERVE_TTL,
    )
    return hits


if __name__ == "__main__":
    setup_pipeline_logging()
    result = asyncio.run(fetch_and_cache_jobs())
    log.info("jobs.extract.done", count=len(result))
