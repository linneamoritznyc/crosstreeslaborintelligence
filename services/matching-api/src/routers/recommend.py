"""Karriärrekommendationer: forcegraf och kompetensgap.

PRD TF-09: graf renderar reell Neo4j-data, aldrig hårdkodade noder.
Vid saknad data returneras tom graf — aldrig fabricerade övergångar.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from ..middleware.logging import get_logger
from ..services.graph import get_career_graph, get_gaps
from ..services.jobed_client import get_education_suggestions

log = get_logger(__name__)
router = APIRouter()


@router.get("/career-graph")
async def career_graph(session: str = Query(..., min_length=1)) -> dict[str, Any]:
    """Returnerar D3-vänlig forcegraf med övergångar för sessionen."""
    graph = await get_career_graph(session)
    return {
        "nodes": graph.get("nodes", []),
        "edges": graph.get("edges", []),
        "source": "Neo4j AuraDB · AF Substitutabilitetsdata · Personalized PageRank",
    }


def _normalize_education(raw: dict[str, Any]) -> dict[str, Any]:
    """Anpassar AF JobEd Connect-svaret till stabilt UI-format."""
    return {
        "title": raw.get("title") or raw.get("name") or raw.get("course_name") or "Utbildning",
        "provider": (
            raw.get("provider")
            or raw.get("organisation")
            or raw.get("school_name")
            or raw.get("education_provider")
            or "Okänd anordnare"
        ),
        "url": raw.get("webpage_url") or raw.get("url") or raw.get("link"),
        "start_date": raw.get("start_date") or raw.get("start_date_str"),
        "location": raw.get("location") or raw.get("municipality") or raw.get("city"),
    }


@router.get("/gaps")
async def skill_gaps(
    session: str = Query(..., min_length=1),
    target: str = Query(..., min_length=1),
    lan: str = Query(default="06"),
) -> dict[str, Any]:
    """Returnerar kompetensgap mot målyrke + YH-utbildningar som täcker gapet."""
    gaps_data = await get_gaps(session, target)

    education_suggestions: list[dict[str, Any]] = []
    try:
        raw_educations = await get_education_suggestions(target, lan)
        education_suggestions = [_normalize_education(e) for e in raw_educations]
    except Exception as exc:  # noqa: BLE001
        log.warning("recommend.gaps.education_unavailable", target=target, error=str(exc))

    return {
        **gaps_data,
        "education_suggestions": education_suggestions,
        "source": "Neo4j REQUIRES_SKILL · JobEd Connect (Arbetsförmedlingen)",
    }
