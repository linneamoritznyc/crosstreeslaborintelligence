"""Kompetensgrafen-specifik logik: omställningsanalys, brist, karta, ROI.

Använder Neo4j-data (substitutabilitetsgraf) som primär källa, AF Platsbanken
för live-annonsräkning. SCB-anrop är optionella tilläggsdata.
"""
from __future__ import annotations

import os
from typing import Any

import httpx
from neo4j import AsyncGraphDatabase

from ..middleware.logging import get_logger
from ._af_http import af_request

log = get_logger(__name__)

_driver = AsyncGraphDatabase.driver(
    os.environ.get("NEO4J_URI", ""),
    auth=(
        os.environ.get("NEO4J_USERNAME", "neo4j"),
        os.environ.get("NEO4J_PASSWORD", ""),
    ),
)

_AF_BASE = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")
_LAN = os.environ.get("JONKOPING_LAN_CODE", "06")

# SSYK 2-digit prefix per "sektor" — används för att klassificera yrken brett.
_SEKTOR_SSYK_PREFIX: dict[str, tuple[str, ...]] = {
    "industri": ("31", "72", "81", "82", "74"),
    "vard": ("22", "53", "32"),
    "it": ("25", "35"),
    "bygg": ("71", "75"),
    "logistik": ("43", "83", "93"),
    "service": ("14", "51", "52"),
    "utbildning": ("23",),
}


async def list_occupations_for_sektor(sektor: str) -> list[dict]:
    """Returnerar yrken som tillhör en sektor enligt SSYK-prefix-mappning."""
    prefixes = _SEKTOR_SSYK_PREFIX.get(sektor, ())
    if not prefixes:
        return []
    async with _driver.session() as db:
        result = await db.run(
            """
            MATCH (o:Occupation)
            WHERE any(prefix IN $prefixes WHERE o.ssyk_code STARTS WITH prefix)
            RETURN o.id AS id, o.name AS name, o.ssyk_code AS ssyk_code,
                   o.workplace_model AS workplace_model
            ORDER BY o.name
            """,
            prefixes=list(prefixes),
        )
        return await result.data()


async def get_omstallning(target_occupation_id: str | None = None) -> dict:
    """Hämtar omställningsanalys: vilka yrken kan ersätta målyrket?

    Om target saknas: returnerar lista över alla yrken med utgående
    substituerbarhetskanter. Score är AF substitutabilitetsdata (25/50/75).
    """
    async with _driver.session() as db:
        if target_occupation_id:
            result = await db.run(
                """
                MATCH (källa:Occupation)-[r:SUBSTITUTABLE_BY]->(mål:Occupation {id: $id})
                RETURN källa.id AS id, källa.name AS name, källa.ssyk_code AS ssyk,
                       r.score AS score, mål.name AS target_name
                ORDER BY r.score DESC
                """,
                id=target_occupation_id,
            )
            kallor = await result.data()
            target_name = kallor[0]["target_name"] if kallor else target_occupation_id
            return {
                "target_occupation_id": target_occupation_id,
                "target_occupation_name": target_name,
                "kallor": [
                    {
                        "occupation_id": k["id"],
                        "occupation_name": k["name"],
                        "ssyk_code": k["ssyk"],
                        "substitutability_score": k["score"] / 100.0,
                        "rekommenderade_utbildningar": [],
                    }
                    for k in kallor
                ],
                "datakalla": "AF Substitutabilitetsdata + Neo4j PageRank",
            }
        result = await db.run(
            """
            MATCH (a:Occupation)-[r:SUBSTITUTABLE_BY]->(b:Occupation)
            RETURN a.id AS id, a.name AS name, b.name AS target,
                   r.score AS score
            ORDER BY r.score DESC, a.name
            LIMIT 30
            """
        )
        rows = await result.data()
        return {
            "kallor": [
                {
                    "occupation_id": r["id"],
                    "occupation_name": r["name"],
                    "substitutability_score": r["score"] / 100.0,
                    "target_occupation_name": r["target"],
                    "rekommenderade_utbildningar": [],
                }
                for r in rows
            ],
            "datakalla": "AF Substitutabilitetsdata + Neo4j",
        }


async def _count_jobs(occupation_id: str) -> int:
    """Slår mot AF Platsbanken för annonsräkning per yrke. 0 vid fel."""
    body: dict[str, Any] = {
        "limit": 0,
        "offset": 0,
        "region": _LAN,
        "occupation-name": occupation_id,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await af_request(client, "POST", f"{_AF_BASE}/search", json=body)
        payload = response.json()
        total = payload.get("total", {})
        return int(total.get("value", 0)) if isinstance(total, dict) else int(total or 0)
    except Exception:
        return 0


async def get_brist_for_sektor(sektor: str) -> list[dict]:
    """Returnerar yrken i sektorn med live AF-annonsräkning som bristindikator."""
    import asyncio

    yrken = await list_occupations_for_sektor(sektor)
    if not yrken:
        return []
    antal_list = await asyncio.gather(*[_count_jobs(o["id"]) for o in yrken])
    rows = [
        {
            "occupation_id": o["id"],
            "occupation_name": o["name"],
            "brist_index": float(antal),
            "antal_annonser": antal,
            "prognos": "stabil",
            "ssyk_code": o["ssyk_code"],
        }
        for o, antal in zip(yrken, antal_list)
    ]
    rows.sort(key=lambda r: r["antal_annonser"], reverse=True)
    log.info("kompetensgrafen.brist", sektor=sektor, yrken=len(rows))
    return rows


# TODO: Replace with real SCB Yrkesregistret + AF Yrkesbarometern data.
# These are representative placeholders for Jönköpings läns sectors, 2024.
_SECTOR_STATS: dict[str, dict] = {
    "vard": {"employees": 24800, "shortage_pct": 18, "forecast_year": 2040},
    "industri": {"employees": 18200, "shortage_pct": 12, "forecast_year": 2040},
    "bygg": {"employees": 7400, "shortage_pct": 22, "forecast_year": 2040},
    "it": {"employees": 8600, "shortage_pct": 8, "forecast_year": 2040},
    "logistik": {"employees": 11200, "shortage_pct": 9, "forecast_year": 2040},
    "service": {"employees": 15800, "shortage_pct": 7, "forecast_year": 2040},
    "utbildning": {"employees": 12400, "shortage_pct": 15, "forecast_year": 2040},
}


async def get_sector_stats(sektor: str) -> dict:
    """Returnerar sysselsättningsstatistik per sektor.

    TODO: Wire up real SCB Yrkesregistret API and AF Yrkesbarometern data.
    """
    stats = _SECTOR_STATS.get(sektor, {"employees": 10000, "shortage_pct": 10, "forecast_year": 2040})
    return {
        "sektor": sektor,
        "employees": stats["employees"],
        "shortage_pct": stats["shortage_pct"],
        "forecast_year": stats["forecast_year"],
        "source": "SCB Yrkesregistret 2024 + AF Yrkesbarometern 2026 [placeholder]",
    }


async def get_top_shortage_occupations(sektor: str) -> list[dict]:
    """Returnerar topp-10 bristyrken i sektorn, rangordnade efter annonsvolym.

    Shortage-procent beräknas relativt maxvärdet i sektorn.
    TODO: Replace relative scaling with real AF Yrkesbarometern shortage index.
    """
    yrken = await get_brist_for_sektor(sektor)
    if not yrken:
        return []
    max_index = max(r["brist_index"] for r in yrken) or 1
    top10 = yrken[:10]
    return [
        {
            "rank": i + 1,
            "occupation_id": row["occupation_id"],
            "name": row["occupation_name"],
            "ssyk_code": row.get("ssyk_code") or "—",
            "shortage_pct": round((row["brist_index"] / max_index) * 82 + 10),
            "antal_annonser": row["antal_annonser"],
        }
        for i, row in enumerate(top10)
    ]


async def close() -> None:
    await _driver.close()
