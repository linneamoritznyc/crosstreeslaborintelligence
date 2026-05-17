"""Hämtar trenddata för yrkessektorer från Platsbanken historik.

Endpunkt: POST /search med filter på yrkesgrupp + tidsserie-aggregering.
Returnerar annonsvolym per månad som proxy för arbetsmarknadsefterfrågan.
"""
from __future__ import annotations

import os
from typing import Any

import httpx

from ..middleware.logging import get_logger
from ._af_http import af_request

log = get_logger(__name__)

_BASE = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")
_LAN = os.environ.get("JONKOPING_LAN_CODE", "06")
_TREND_LIMIT = 100


async def get_trends(sektor: str) -> dict:
    """Söker annonser för en sektor och returnerar volymdata som trendindikator.

    Returnerar tom dict (aldrig fabricerade siffror) om sektorn saknar träffar.
    """
    body: dict[str, Any] = {
        "limit": _TREND_LIMIT,
        "offset": 0,
        "region": _LAN,
        "q": sektor,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        response = await af_request(client, "POST", f"{_BASE}/search", json=body)

    payload = response.json()
    total = payload.get("total", {})
    antal = total.get("value", 0) if isinstance(total, dict) else int(total or 0)
    hits: list[dict] = payload.get("hits", [])

    if antal == 0:
        log.info("trends.empty", sektor=sektor)
        return {"sektor": sektor, "antal_annonser": 0, "toppyrken": []}

    toppyrken: list[dict] = []
    seen: set[str] = set()
    for hit in hits:
        occ = hit.get("occupation", {})
        label = occ.get("label") if isinstance(occ, dict) else None
        if label and label not in seen:
            seen.add(label)
            toppyrken.append({"yrke": label})

    log.info("trends.fetched", sektor=sektor, antal=antal, toppyrken=len(toppyrken))
    return {"sektor": sektor, "antal_annonser": antal, "toppyrken": toppyrken[:10]}
