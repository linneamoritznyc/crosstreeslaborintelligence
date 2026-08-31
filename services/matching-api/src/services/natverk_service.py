"""Bygger kompetensnätverket: yrken som noder, substituerbarhet som kanter.

Primärkälla är Neo4j (samma graf som seeder.py laddar vid uppstart).
Annonsvolym hämtas live från AF Platsbanken och är rent tilläggsdata.

Regel för hela modulen: ett fält som inte kunde hämtas returneras som None,
aldrig som 0. Frontend visar då "okänt" i stället för att påstå att ett yrke
saknar lediga jobb.
"""
from __future__ import annotations

import asyncio
import os
from typing import Any

import httpx
from neo4j import AsyncGraphDatabase

from ..middleware.logging import get_logger
from ._af_http import af_request

log = get_logger(__name__)

_AF_BASE = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")

# AF Platsbanken filtrerar på taxonomi-concept-id, inte på SCB:s länskod.
# Sätts som env-variabel när rätt id är verifierat; tills dess körs sökningen
# utan regionfilter i stället för att skicka ett id vi inte vet stämmer.
_AF_REGION_CONCEPT_ID = os.environ.get("AF_REGION_CONCEPT_ID", "").strip()

# SSYK-2-prefix per sektor — samma indelning som kompetensgrafen_service.
_SEKTOR_SSYK_PREFIX: dict[str, tuple[str, ...]] = {
    "industri": ("31", "72", "81", "82", "74"),
    "vard": ("22", "53", "32"),
    "it": ("25", "35"),
    "bygg": ("71", "75"),
    "logistik": ("43", "83", "93"),
    "service": ("14", "51", "52"),
    "utbildning": ("23",),
}

_driver = AsyncGraphDatabase.driver(
    os.environ.get("NEO4J_URI", ""),
    auth=(
        os.environ.get("NEO4J_USERNAME", "neo4j"),
        os.environ.get("NEO4J_PASSWORD", ""),
    ),
)


def _sektor_for_ssyk(ssyk: str | None) -> str:
    if not ssyk:
        return "ovrigt"
    for sektor, prefixes in _SEKTOR_SSYK_PREFIX.items():
        if any(ssyk.startswith(p) for p in prefixes):
            return sektor
    return "ovrigt"


async def _rakna_annonser(client: httpx.AsyncClient, namn: str) -> int | None:
    """Antal aktiva annonser för ett yrke. None vid fel — aldrig 0 som gissning."""
    body: dict[str, Any] = {"q": namn, "limit": 0, "offset": 0}
    if _AF_REGION_CONCEPT_ID:
        body["region"] = _AF_REGION_CONCEPT_ID
    try:
        response = await af_request(client, "POST", f"{_AF_BASE}/search", json=body)
        payload = response.json()
        total = payload.get("total", {})
        if isinstance(total, dict):
            return int(total.get("value", 0))
        return int(total or 0)
    except Exception as exc:
        log.info("natverk.annonser.misslyckades", yrke=namn, fel=str(exc)[:120])
        return None


async def _hamta_annonser(namn_lista: list[str]) -> dict[str, int | None]:
    """Hämtar annonsvolym för alla yrken parallellt. Tom dict om AF inte svarar."""
    if not namn_lista:
        return {}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resultat = await asyncio.gather(
                *[_rakna_annonser(client, namn) for namn in namn_lista]
            )
        return dict(zip(namn_lista, resultat))
    except Exception as exc:
        log.warning("natverk.annonser.avbruten", fel=str(exc)[:160])
        return {namn: None for namn in namn_lista}


async def hamta_natverk(inkludera_annonser: bool = True) -> dict:
    """Returnerar hela kompetensnätverket med metadata om datans faktiska omfång."""
    async with _driver.session() as db:
        resultat = await db.run(
            """
            MATCH (o:Occupation)
            WHERE o.deprecated IS NULL
            RETURN o.id AS id, o.name AS namn, o.ssyk_code AS ssyk,
                   o.definition AS definition, o.workplace_model AS arbetsform
            ORDER BY o.name
            """
        )
        rader = await resultat.data()

        resultat = await db.run(
            """
            MATCH (a:Occupation)-[r:SUBSTITUTABLE_BY]->(b:Occupation)
            RETURN a.id AS kalla, b.id AS mal, r.score AS score,
                   r.direction AS riktning
            """
        )
        kant_rader = await resultat.data()

        resultat = await db.run("MATCH (s:Skill) RETURN count(s) AS n")
        antal_kompetenser = (await resultat.single())["n"]

        # Delade kompetenser per yrkespar — kräver REQUIRES-relationer.
        # Saknas de i databasen blir listan tom och flaggas i meta.
        resultat = await db.run(
            """
            MATCH (a:Occupation)-[:REQUIRES]->(s:Skill)<-[:REQUIRES]-(b:Occupation)
            WHERE a.id < b.id
            RETURN a.id AS kalla, b.id AS mal, collect(DISTINCT s.name) AS delade
            """
        )
        delade_rader = await resultat.data()

    noder = [
        {
            "id": r["id"],
            "namn": r["namn"],
            "ssyk": r["ssyk"] or "",
            "sektor": _sektor_for_ssyk(r["ssyk"]),
            "definition": r["definition"] or "",
            "arbetsform": r["arbetsform"] or "",
            "annonser": None,
            "trend30": None,
            "medianlon": None,
        }
        for r in rader
    ]

    delade_index = {
        tuple(sorted((r["kalla"], r["mal"]))): r["delade"] for r in delade_rader
    }

    # Kollapsa riktade kanter till odirigerade par, behåll riktningarna.
    par: dict[tuple[str, str], dict] = {}
    for r in kant_rader:
        nyckel = tuple(sorted((r["kalla"], r["mal"])))
        post = par.setdefault(
            nyckel, {"score": 0, "riktningar": [], "delade_kompetenser": []}
        )
        post["score"] = max(post["score"], int(r["score"] or 0))
        post["riktningar"].append(
            {"fran": r["kalla"], "till": r["mal"], "typ": r["riktning"] or "okand"}
        )

    kanter = [
        {
            "kalla": nyckel[0],
            "mal": nyckel[1],
            "score": post["score"],
            "riktningar": post["riktningar"],
            "delade_kompetenser": delade_index.get(nyckel, []),
        }
        for nyckel, post in sorted(par.items())
    ]

    annonser_live = False
    if inkludera_annonser and noder:
        annonser = await _hamta_annonser([n["namn"] for n in noder])
        for nod in noder:
            nod["annonser"] = annonser.get(nod["namn"])
        annonser_live = any(v is not None for v in annonser.values())

    log.info(
        "natverk.hamtad",
        yrken=len(noder),
        kanter=len(kanter),
        annonser_live=annonser_live,
    )

    return {
        "noder": noder,
        "kanter": kanter,
        "meta": {
            "kalla": "api",
            "yrken": len(noder),
            "kompetenser": antal_kompetenser,
            "kanter_riktade": len(kant_rader),
            "kanter_odirigerade": len(kanter),
            "annonser_live": annonser_live,
            "delade_kompetenser_tillgangliga": bool(delade_index),
        },
    }


async def close() -> None:
    await _driver.close()
