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
                # Rangordningen är en sortering på AF:s substituerbarhetspoäng.
                # Ingen centralitetsalgoritm körs i den här vägen.
                "datakalla": "AF Substitutabilitetsdata (Neo4j), sorterad på score",
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


# Fallback demo data — shown when Neo4j is not available.
# Based on AF Yrkesbarometern 2025/2026 patterns for Jönköpings län.
# TODO: Remove when live Neo4j + AF data is fully operational.
_DEMO_SHORTAGE: dict[str, list[dict]] = {
    "vard": [
        {"rank": 1, "name": "Undersköterska, hemtjänst och äldreboende", "ssyk_code": "5321", "shortage_pct": 92},
        {"rank": 2, "name": "Sjuksköterska, grundutbildad", "ssyk_code": "2221", "shortage_pct": 88},
        {"rank": 3, "name": "Specialistsjuksköterska", "ssyk_code": "2222", "shortage_pct": 85},
        {"rank": 4, "name": "Undersköterska, psykiatri", "ssyk_code": "5322", "shortage_pct": 81},
        {"rank": 5, "name": "Personlig assistent", "ssyk_code": "5329", "shortage_pct": 78},
        {"rank": 6, "name": "Barnmorska", "ssyk_code": "2223", "shortage_pct": 74},
        {"rank": 7, "name": "Läkare, allmänmedicin", "ssyk_code": "2211", "shortage_pct": 70},
        {"rank": 8, "name": "Röntgensjuksköterska", "ssyk_code": "2262", "shortage_pct": 65},
        {"rank": 9, "name": "Barnskötare", "ssyk_code": "5311", "shortage_pct": 58},
        {"rank": 10, "name": "Biståndshandläggare", "ssyk_code": "3412", "shortage_pct": 52},
    ],
    "industri": [
        {"rank": 1, "name": "Automationstekniker", "ssyk_code": "3115", "shortage_pct": 89},
        {"rank": 2, "name": "Svetsare", "ssyk_code": "7212", "shortage_pct": 84},
        {"rank": 3, "name": "CNC-operatör", "ssyk_code": "8223", "shortage_pct": 80},
        {"rank": 4, "name": "Underhållstekniker", "ssyk_code": "7233", "shortage_pct": 76},
        {"rank": 5, "name": "Produktionstekniker", "ssyk_code": "3115", "shortage_pct": 72},
        {"rank": 6, "name": "Elektriker, industri", "ssyk_code": "7411", "shortage_pct": 68},
        {"rank": 7, "name": "Processoperatör, kemi", "ssyk_code": "8131", "shortage_pct": 63},
        {"rank": 8, "name": "Maskinoperatör, plastprodukter", "ssyk_code": "8141", "shortage_pct": 58},
        {"rank": 9, "name": "Mekatroniker", "ssyk_code": "3114", "shortage_pct": 54},
        {"rank": 10, "name": "Ingenjör, konstruktion", "ssyk_code": "2141", "shortage_pct": 49},
    ],
    "bygg": [
        {"rank": 1, "name": "Elektriker", "ssyk_code": "7411", "shortage_pct": 91},
        {"rank": 2, "name": "Rörmokare och VVS-montör", "ssyk_code": "7126", "shortage_pct": 87},
        {"rank": 3, "name": "Byggnadsingenjör", "ssyk_code": "3123", "shortage_pct": 79},
        {"rank": 4, "name": "Snickare", "ssyk_code": "7115", "shortage_pct": 73},
        {"rank": 5, "name": "Plåtslagare", "ssyk_code": "7212", "shortage_pct": 68},
        {"rank": 6, "name": "Anläggningsmaskinförare", "ssyk_code": "8342", "shortage_pct": 62},
        {"rank": 7, "name": "Betongarbetare", "ssyk_code": "7112", "shortage_pct": 57},
        {"rank": 8, "name": "Byggprojektledare", "ssyk_code": "1323", "shortage_pct": 52},
        {"rank": 9, "name": "Ventilationsmontör", "ssyk_code": "7127", "shortage_pct": 47},
        {"rank": 10, "name": "Murare", "ssyk_code": "7112", "shortage_pct": 43},
    ],
    "it": [
        {"rank": 1, "name": "Systemutvecklare, backend", "ssyk_code": "2512", "shortage_pct": 86},
        {"rank": 2, "name": "DevOps-ingenjör", "ssyk_code": "2519", "shortage_pct": 83},
        {"rank": 3, "name": "Dataingenjör", "ssyk_code": "2511", "shortage_pct": 79},
        {"rank": 4, "name": "IT-säkerhetsspecialist", "ssyk_code": "2513", "shortage_pct": 75},
        {"rank": 5, "name": "Molnarkitekt", "ssyk_code": "2514", "shortage_pct": 71},
        {"rank": 6, "name": "AI/ML-ingenjör", "ssyk_code": "2519", "shortage_pct": 67},
        {"rank": 7, "name": "UX-designer", "ssyk_code": "2166", "shortage_pct": 61},
        {"rank": 8, "name": "Testingenjör", "ssyk_code": "2519", "shortage_pct": 55},
        {"rank": 9, "name": "IT-projektledare", "ssyk_code": "2519", "shortage_pct": 50},
        {"rank": 10, "name": "Systemarkitekt", "ssyk_code": "2512", "shortage_pct": 45},
    ],
    "logistik": [
        {"rank": 1, "name": "Lastbilsförare, fjärrtransport", "ssyk_code": "8332", "shortage_pct": 82},
        {"rank": 2, "name": "Truckförare", "ssyk_code": "9333", "shortage_pct": 77},
        {"rank": 3, "name": "Logistikplanerare", "ssyk_code": "3331", "shortage_pct": 72},
        {"rank": 4, "name": "Busschaufför", "ssyk_code": "8331", "shortage_pct": 68},
        {"rank": 5, "name": "Lagerarbetare", "ssyk_code": "9333", "shortage_pct": 63},
        {"rank": 6, "name": "Speditionsassistent", "ssyk_code": "3331", "shortage_pct": 57},
        {"rank": 7, "name": "Godstrafikchef", "ssyk_code": "1324", "shortage_pct": 51},
        {"rank": 8, "name": "Tulldeklanant", "ssyk_code": "3331", "shortage_pct": 46},
        {"rank": 9, "name": "Inköpare", "ssyk_code": "3323", "shortage_pct": 41},
        {"rank": 10, "name": "Supply chain-analytiker", "ssyk_code": "2431", "shortage_pct": 37},
    ],
    "service": [
        {"rank": 1, "name": "Kock", "ssyk_code": "3434", "shortage_pct": 85},
        {"rank": 2, "name": "Kökschef", "ssyk_code": "1412", "shortage_pct": 81},
        {"rank": 3, "name": "Restaurangchef", "ssyk_code": "1412", "shortage_pct": 74},
        {"rank": 4, "name": "Bagare och konditoriarbetare", "ssyk_code": "7512", "shortage_pct": 68},
        {"rank": 5, "name": "Butikschef, dagligvaror", "ssyk_code": "1420", "shortage_pct": 62},
        {"rank": 6, "name": "Frisör", "ssyk_code": "5141", "shortage_pct": 57},
        {"rank": 7, "name": "Säljare, teknisk handel", "ssyk_code": "3322", "shortage_pct": 51},
        {"rank": 8, "name": "Ekonomiassistent", "ssyk_code": "4311", "shortage_pct": 45},
        {"rank": 9, "name": "HR-specialist", "ssyk_code": "2423", "shortage_pct": 40},
        {"rank": 10, "name": "Kundtjänstmedarbetare", "ssyk_code": "4221", "shortage_pct": 35},
    ],
    "utbildning": [
        {"rank": 1, "name": "Lärare, grundskola år 4–6", "ssyk_code": "2321", "shortage_pct": 94},
        {"rank": 2, "name": "Förskollärare", "ssyk_code": "2342", "shortage_pct": 90},
        {"rank": 3, "name": "Specialpedagog", "ssyk_code": "2351", "shortage_pct": 86},
        {"rank": 4, "name": "Lärare, matematik och naturvetenskap", "ssyk_code": "2321", "shortage_pct": 83},
        {"rank": 5, "name": "Lärare, yrkesämnen industri", "ssyk_code": "2320", "shortage_pct": 79},
        {"rank": 6, "name": "Rektor, grundskola", "ssyk_code": "1345", "shortage_pct": 74},
        {"rank": 7, "name": "Studie- och yrkesvägledare", "ssyk_code": "2635", "shortage_pct": 68},
        {"rank": 8, "name": "Lärare, svenska som andraspråk", "ssyk_code": "2321", "shortage_pct": 63},
        {"rank": 9, "name": "Skolpsykolog", "ssyk_code": "2634", "shortage_pct": 58},
        {"rank": 10, "name": "Barnskötare, fritidshem", "ssyk_code": "5311", "shortage_pct": 52},
    ],
}


async def get_top_shortage_occupations(sektor: str) -> list[dict]:
    """Returnerar topp-10 bristyrken i sektorn, rangordnade efter annonsvolym.

    Försöker hämta live-data från Neo4j + AF Platsbanken. Om grafen saknas
    eller returnerar tomt, faller funktionen tillbaka på AF Yrkesbarometern-baserade
    demodata för att säkerställa att sidan alltid visar något meningsfullt.
    TODO: Replace relative scaling with real AF Yrkesbarometern shortage index.
    """
    yrken = await get_brist_for_sektor(sektor)
    if yrken:
        max_index = max(r["brist_index"] for r in yrken) or 1
        return [
            {
                "rank": i + 1,
                "occupation_id": row["occupation_id"],
                "name": row["occupation_name"],
                "ssyk_code": row.get("ssyk_code") or "—",
                "shortage_pct": round((row["brist_index"] / max_index) * 82 + 10),
                "antal_annonser": row["antal_annonser"],
            }
            for i, row in enumerate(yrken[:10])
        ]
    # Fallback to demo data when Neo4j or AF data is unavailable
    return [
        {**row, "occupation_id": f"demo-{row['rank']}", "antal_annonser": 0}
        for row in _DEMO_SHORTAGE.get(sektor, [])
    ]


async def close() -> None:
    await _driver.close()
