"""Demo-endpoints för att kringgå CV-uppladdning i miljöer utan Anthropic.

Skapar en session med fördefinierade kompetenser baserade på ett målyrke.
Används vid demo, smoke-test och utan ANTHROPIC_API_KEY.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Query

from ..middleware.logging import get_logger
from ..services.embeddings import store_session_skills

log = get_logger(__name__)
router = APIRouter()


_EXEMPELPROFILER: dict[str, list[str]] = {
    "maskinoperator": [
        "Svetsning",
        "CNC-programmering",
        "Ritningsläsning",
        "Kvalitetskontroll",
        "Lean produktion",
        "Hydraulik",
    ],
    "undersköterska": [
        "Patientvård",
        "Journalföring",
        "Läkemedelshantering",
        "Hjärt- och lungräddning",
        "Vårdhygien",
        "Demensvård",
    ],
    "mjukvaruutvecklare": [
        "Python",
        "SQL",
        "REST API",
        "Versionshantering med Git",
        "Agil systemutveckling",
        "Linux",
    ],
    "lagerarbetare": [
        "Truckkort",
        "Lagerhantering",
        "Varuhantering",
    ],
}


@router.post("/session")
async def skapa_demosession(profil: str = Query(default="maskinoperator")):
    """Skapar en demo-session med fördefinierade kompetenser."""
    skills = _EXEMPELPROFILER.get(profil, _EXEMPELPROFILER["maskinoperator"])
    session_id = str(uuid.uuid4())
    await store_session_skills(session_id, skills)
    log.info("demo.session_created", session_id=session_id, profil=profil, skills=len(skills))
    return {
        "session_id": session_id,
        "profil": profil,
        "skill_count": len(skills),
        "skills": skills,
    }


@router.get("/profiler")
async def lista_profiler():
    return [{"id": k, "skills": v} for k, v in _EXEMPELPROFILER.items()]


@router.get("/neo4j-check")
async def neo4j_check():
    """Smoke-test: räknar noder och kanter i Neo4j för att verifiera anslutning."""
    import os

    from neo4j import AsyncGraphDatabase

    uri = os.environ.get("NEO4J_URI")
    if not uri:
        return {"status": "ej_konfigurerad", "detalj": "NEO4J_URI saknas"}

    driver = AsyncGraphDatabase.driver(
        uri,
        auth=(
            os.environ.get("NEO4J_USERNAME", "neo4j"),
            os.environ.get("NEO4J_PASSWORD", ""),
        ),
    )
    try:
        async with driver.session() as db:
            result = await db.run(
                "MATCH (o:Occupation) RETURN count(o) AS yrken"
            )
            yrken = (await result.single())["yrken"]
            result = await db.run(
                "MATCH (s:Skill) RETURN count(s) AS kompetenser"
            )
            kompetenser = (await result.single())["kompetenser"]
            result = await db.run(
                "MATCH ()-[r:SUBSTITUTABLE_WITH]->() RETURN count(r) AS kanter"
            )
            kanter = (await result.single())["kanter"]
        await driver.close()
        return {
            "status": "ok",
            "yrken": yrken,
            "kompetenser": kompetenser,
            "substitutability_kanter": kanter,
        }
    except Exception as exc:
        try:
            await driver.close()
        except Exception:
            pass
        return {"status": "error", "detalj": str(exc)[:200]}
