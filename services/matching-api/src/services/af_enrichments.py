"""Berikanar jobbannonser via AF Enrichments API.

Endpunkt: POST /enrich/ad med body {text: <annonstext>}
"""
from __future__ import annotations

import os

import httpx

from ..middleware.logging import get_logger
from ._af_http import af_request

log = get_logger(__name__)

_BASE = os.environ.get(
    "AF_ENRICHMENTS_URL", "https://jobad-enrichments.api.jobtechdev.se"
)


async def enrich_job_ad(ad_text: str) -> dict:
    """Skickar annonstext till AF Enrichments och returnerar extraherade entiteter."""
    async with httpx.AsyncClient(timeout=60) as client:
        response = await af_request(
            client, "POST", f"{_BASE}/enrich/ad", json={"text": ad_text}
        )
    data: dict = response.json()
    log.info(
        "af_enrichments.enrich",
        skills=len(data.get("skills", [])),
        occupations=len(data.get("occupations", [])),
    )
    return data
