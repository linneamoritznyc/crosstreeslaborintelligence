"""Geo- och kartdata för Kompetensgrafen.

Jönköpings läns 13 kommuner med ungefärliga centroidkoordinater (WGS84).
För produktion bör SCB Geodata RegSO 2025 (GeoJSON) användas — denna
inbäddade lista är en provisorisk källa tills GeoJSON-filen är installerad
i infra/geo/jonkopings_lan_kommuner.geojson.
"""
from __future__ import annotations

import os
from typing import Any

import httpx

from ..middleware.logging import get_logger
from ._af_http import af_request

log = get_logger(__name__)

_AF_BASE = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")

# Källa: SCB Kommunregister 2025. Kommunkoder enligt SCB:s länsindelning,
# centroidkoordinater i WGS84. Vid produktionssättning ersätts dessa av
# polygon-geometrier från SCB Geodata RegSO 2025.
JONKOPINGS_KOMMUNER = [
    {"kod": "0680", "namn": "Jönköping", "lon": 14.171, "lat": 57.781},
    {"kod": "0682", "namn": "Nässjö", "lon": 14.696, "lat": 57.653},
    {"kod": "0683", "namn": "Värnamo", "lon": 14.041, "lat": 57.187},
    {"kod": "0684", "namn": "Sävsjö", "lon": 14.660, "lat": 57.404},
    {"kod": "0685", "namn": "Vetlanda", "lon": 15.073, "lat": 57.428},
    {"kod": "0686", "namn": "Eksjö", "lon": 14.971, "lat": 57.668},
    {"kod": "0604", "namn": "Aneby", "lon": 14.811, "lat": 57.838},
    {"kod": "0617", "namn": "Gnosjö", "lon": 13.741, "lat": 57.357},
    {"kod": "0642", "namn": "Mullsjö", "lon": 13.879, "lat": 57.918},
    {"kod": "0643", "namn": "Habo", "lon": 14.075, "lat": 57.911},
    {"kod": "0662", "namn": "Gislaved", "lon": 13.541, "lat": 57.302},
    {"kod": "0665", "namn": "Vaggeryd", "lon": 14.149, "lat": 57.499},
    {"kod": "0687", "namn": "Tranås", "lon": 14.987, "lat": 58.038},
]


async def _count_jobs_in_kommun(kommun_kod: str, sektor_q: str | None = None) -> int:
    body: dict[str, Any] = {"limit": 0, "offset": 0, "municipality": kommun_kod}
    if sektor_q:
        body["q"] = sektor_q
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await af_request(client, "POST", f"{_AF_BASE}/search", json=body)
        payload = response.json()
        total = payload.get("total", {})
        return int(total.get("value", 0)) if isinstance(total, dict) else int(total or 0)
    except Exception:
        return 0


_SEKTOR_SOKORD: dict[str, str] = {
    "industri": "industri",
    "vard": "vård",
    "it": "it",
    "bygg": "bygg",
    "logistik": "logistik",
    "service": "butik",
    "utbildning": "lärare",
}


async def get_karta_for_sektor(sektor: str) -> list[dict]:
    """Returnerar en lista över Jönköpings kommuner med annonsräkning som brist_index."""
    import asyncio

    sokord = _SEKTOR_SOKORD.get(sektor)
    antal_list = await asyncio.gather(
        *[_count_jobs_in_kommun(k["kod"], sokord) for k in JONKOPINGS_KOMMUNER]
    )
    rows = [
        {
            "kommun_kod": kommun["kod"],
            "namn": kommun["namn"],
            "lon": kommun["lon"],
            "lat": kommun["lat"],
            "brist_index": float(antal),
            "antal_annonser": antal,
        }
        for kommun, antal in zip(JONKOPINGS_KOMMUNER, antal_list)
    ]
    log.info(
        "kompetensgrafen.karta",
        sektor=sektor,
        kommuner=len(rows),
        total_annonser=sum(r["antal_annonser"] for r in rows),
    )
    return rows
