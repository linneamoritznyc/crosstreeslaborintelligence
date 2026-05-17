"""Hämtar utbildningsförslag från AF Jobed Connect API.

Endpunkt verifierad: GET /utbildningar?occupation_concept_id=<id>&lan_kod=<kod>
"""
from __future__ import annotations

import os

import httpx

from ..middleware.logging import get_logger
from ._af_http import af_request

log = get_logger(__name__)

_BASE = os.environ.get("AF_JOBED_URL", "https://jobed-connect.api.jobtechdev.se")
_DEFAULT_LAN = os.environ.get("JONKOPING_LAN_CODE", "06")


async def get_education_suggestions(
    occupation_concept_id: str, lan_kod: str = _DEFAULT_LAN
) -> list[dict]:
    """Hämtar relevanta utbildningar för ett yrke i ett specifikt län."""
    params = {"occupation_concept_id": occupation_concept_id, "lan_kod": lan_kod}
    async with httpx.AsyncClient(timeout=30) as client:
        response = await af_request(
            client, "GET", f"{_BASE}/utbildningar", params=params
        )
    data: list[dict] = response.json() if isinstance(response.json(), list) else []
    log.info(
        "jobed.education_suggestions",
        occupation_id=occupation_concept_id,
        lan=lan_kod,
        count=len(data),
    )
    return data
