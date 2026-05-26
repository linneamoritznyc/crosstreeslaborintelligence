"""Klient mot Platsbanken (AF Jobsearch API).

Endpunkt: POST /search med JSON-body (inte GET-params).
Annonser cachelagras av routers/jobs.py via get_with_swr.
"""
from __future__ import annotations

import os
from typing import Any

import httpx

from ..middleware.logging import get_logger
from ._af_http import af_request

log = get_logger(__name__)

_BASE = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")
_DEFAULT_REGION = os.environ.get("JONKOPING_LAN_CODE", "06")
_SEARCH_LIMIT = 20


async def search_jobs(q: str, region: str | None = None) -> list[dict]:
    """Söker annonser i angiven region (standard: Jönköpings län). Tomt q returnerar senaste annonser."""
    body: dict[str, Any] = {"limit": _SEARCH_LIMIT, "offset": 0}
    if region:
        body["region"] = region
    else:
        body["region"] = _DEFAULT_REGION
    if q:
        body["q"] = q
    async with httpx.AsyncClient(timeout=30) as client:
        response = await af_request(client, "POST", f"{_BASE}/search", json=body)
    hits: list[dict] = response.json().get("hits", [])
    log.info("af_jobsearch.search", q=q, region=body["region"], count=len(hits))
    return hits


async def get_job_detail(job_id: str) -> dict:
    """Hämtar en enskild annons via GET /ad/{id}."""
    async with httpx.AsyncClient(timeout=30) as client:
        response = await af_request(client, "GET", f"{_BASE}/ad/{job_id}")
    data: dict = response.json()
    log.info("af_jobsearch.detail", job_id=job_id)
    return data


async def get_job_skill_ids(skill_ids: list[str], region: str | None = None) -> list[dict]:
    """Söker annonser som matchar givna kompetens-id:n (concept_id-filter)."""
    if not skill_ids:
        return []
    body: dict[str, Any] = {
        "limit": _SEARCH_LIMIT,
        "offset": 0,
        "region": region or _DEFAULT_REGION,
        "skills": skill_ids,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        response = await af_request(client, "POST", f"{_BASE}/search", json=body)
    hits: list[dict] = response.json().get("hits", [])
    log.info("af_jobsearch.skill_match", skills=len(skill_ids), region=body["region"], hits=len(hits))
    return hits


async def get_job_idf(job_id: str) -> tuple[dict[str, str], dict[str, float]]:
    """Returnerar (skill→role, skill→idf) för en annons.

    idf sätts till 1.0 tills pipeline-körning beräknar korrekta IDF-vikter
    från historiska annonser. Returnerar aldrig fabricerade vikter.
    """
    detail = await get_job_detail(job_id)
    must_skills = {
        s["concept_id"]: "required"
        for s in detail.get("must_have", {}).get("skills", [])
        if isinstance(s.get("concept_id"), str)
    }
    nice_skills = {
        s["concept_id"]: "preferred"
        for s in detail.get("nice_to_have", {}).get("skills", [])
        if isinstance(s.get("concept_id"), str)
    }
    job_skills = {**must_skills, **nice_skills}
    idf: dict[str, float] = {k: 1.0 for k in job_skills}
    return job_skills, idf
