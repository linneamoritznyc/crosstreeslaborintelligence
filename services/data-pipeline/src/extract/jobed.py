"""Extraherar utbildningsdata från Jobed Connect.

Endpunkt: GET /utbildningar?occupation_concept_id=<id>&lan_kod=<kod>
"""
from __future__ import annotations

import os

import httpx

from .._shared.http import request_with_retry
from .._shared.logging import get_logger

log = get_logger(__name__)

AF_JOBED_URL = os.environ.get("AF_JOBED_URL", "https://jobed-connect.api.jobtechdev.se")
_DEFAULT_LAN = os.environ.get("JONKOPING_LAN_CODE", "06")


async def extract_education(
    occupation_id: str, lan_kod: str = _DEFAULT_LAN
) -> list[dict]:
    """Hämtar utbildningsförslag för ett yrke i ett specifikt län."""
    params = {"occupation_concept_id": occupation_id, "lan_kod": lan_kod}
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await request_with_retry(
                client, "GET", f"{AF_JOBED_URL}/utbildningar", params=params
            )
        except Exception as exc:
            log.error("jobed.extract.failed", occupation_id=occupation_id, fel=str(exc))
            return []
    data = response.json()
    result: list[dict] = data if isinstance(data, list) else []
    log.info("jobed.extract", occupation_id=occupation_id, count=len(result))
    return result
