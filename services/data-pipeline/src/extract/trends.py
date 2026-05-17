"""Extraherar trenddata för yrken och sektorer via Platsbanken.

Använder POST /search med sektorsterm som sökfråga och returnerar annonsvolym
som proxy för arbetsmarknadsefterfrågan — /complete är autocomplete, inte trend.
"""
from __future__ import annotations

import os
from typing import Any

import httpx

from .._shared.http import request_with_retry
from .._shared.logging import get_logger

log = get_logger(__name__)

AF_JOBSEARCH_URL = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")
_LAN = os.environ.get("JONKOPING_LAN_CODE", "06")
_LIMIT = 100


async def extract_occupation_trends(sektor: str) -> dict:
    """Hämtar annonsvolym och toppyrken för en sektor i Jönköpings län."""
    body: dict[str, Any] = {"limit": _LIMIT, "offset": 0, "region": _LAN, "q": sektor}
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await request_with_retry(
                client, "POST", f"{AF_JOBSEARCH_URL}/search", json=body
            )
        except Exception as exc:
            log.error("trends.extract.failed", sektor=sektor, fel=str(exc))
            return {"sektor": sektor, "antal_annonser": 0, "toppyrken": []}

    payload = response.json()
    total = payload.get("total", {})
    antal = total.get("value", 0) if isinstance(total, dict) else int(total or 0)
    hits: list[dict] = payload.get("hits", [])

    seen: set[str] = set()
    toppyrken: list[str] = []
    for hit in hits:
        occ = hit.get("occupation", {})
        label = occ.get("label") if isinstance(occ, dict) else None
        if label and label not in seen:
            seen.add(label)
            toppyrken.append(label)

    log.info("trends.extract", sektor=sektor, antal=antal, toppyrken=len(toppyrken))
    return {"sektor": sektor, "antal_annonser": antal, "toppyrken": toppyrken[:10]}
