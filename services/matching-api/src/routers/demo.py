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
