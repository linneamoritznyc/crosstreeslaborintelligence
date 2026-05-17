"""Hämtar yrken och kompetenser från AF Taxonomi-API.

Endpunkter verifierade mot produktion:
  GET /v1/taxonomy/concepts?type=occupation-name&filter=<q>&limit=<n>
  GET /v1/taxonomy/concepts?type=competency&filter=<q>&limit=<n>
"""
from __future__ import annotations

import os

import httpx

from ..middleware.logging import get_logger
from ._af_http import af_request

log = get_logger(__name__)

_BASE = os.environ.get("AF_TAXONOMY_URL", "https://taxonomy.api.jobtechdev.se")
_DEFAULT_LIMIT = 50


async def get_occupation(query: str) -> list[dict]:
    """Söker yrken med valfri fritextsökning. Tom sträng returnerar de första."""
    params: dict = {"type": "occupation-name", "limit": _DEFAULT_LIMIT}
    if query:
        params["filter"] = query
    async with httpx.AsyncClient(timeout=30) as client:
        response = await af_request(client, "GET", f"{_BASE}/v1/taxonomy/concepts", params=params)
    data: list[dict] = response.json()
    log.info("af_taxonomy.get_occupation", query=query, count=len(data))
    return data


async def get_skills(query: str) -> list[dict]:
    """Söker kompetenskoncept med valfri fritextsökning."""
    params: dict = {"type": "competency", "limit": _DEFAULT_LIMIT}
    if query:
        params["filter"] = query
    async with httpx.AsyncClient(timeout=30) as client:
        response = await af_request(client, "GET", f"{_BASE}/v1/taxonomy/concepts", params=params)
    data: list[dict] = response.json()
    log.info("af_taxonomy.get_skills", query=query, count=len(data))
    return data
