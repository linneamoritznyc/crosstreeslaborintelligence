"""Matchningsendpunkter: rankade jobblista och detaljerad fit-poäng.

PRD TF-03/TF-04: varje jobb returneras med Fit Score, matchade/saknade
kompetenser och Wilson 95% konfidensintervall. Aldrig fabricerade poäng.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from ..middleware.logging import get_logger
from ..services.af_jobsearch import get_job_idf, get_job_skill_ids
from ..services.embeddings import get_session_skill_ids
from ..services.fit_score import calculate_fit_score

log = get_logger(__name__)
router = APIRouter()


def _extract_skill_map(hit: dict) -> tuple[dict[str, str], dict[str, str]]:
    """Bygger {skill_id: 'required'|'preferred'} och {skill_id: skill_name}."""
    skill_map: dict[str, str] = {}
    name_map: dict[str, str] = {}
    for s in hit.get("must_have", {}).get("skills", []) or []:
        if isinstance(s.get("concept_id"), str):
            skill_map[s["concept_id"]] = "required"
            name_map[s["concept_id"]] = s.get("label") or s["concept_id"]
    for s in hit.get("nice_to_have", {}).get("skills", []) or []:
        if isinstance(s.get("concept_id"), str):
            skill_map.setdefault(s["concept_id"], "preferred")
            name_map.setdefault(s["concept_id"], s.get("label") or s["concept_id"])
    return skill_map, name_map


def _summarize_hit(hit: dict) -> dict[str, Any]:
    """Plockar ut UI-fält ur AF-hit; tomma fält ger null (aldrig fabricerat)."""
    employer = (hit.get("employer") or {}).get("name")
    workplace = (hit.get("workplace_address") or {}).get("municipality")
    occupation = (hit.get("occupation") or {}).get("label")
    source_links = hit.get("source_links") or []
    source_url = source_links[0].get("url") if source_links else None
    return {
        "id": hit.get("id"),
        "title": hit.get("headline") or hit.get("title") or "Okänd titel",
        "employer": employer,
        "municipality": workplace,
        "occupation": occupation,
        "published_at": hit.get("publication_date"),
        "deadline": hit.get("application_deadline"),
        "url": hit.get("webpage_url") or source_url,
    }


@router.get("/jobs")
async def matched_jobs(session: str = Query(..., min_length=1)) -> list[dict]:
    """Returnerar jobbannonser rankade efter Fit Score mot CV-sessionen.

    Beräknar Fit Score direkt från AF-hittens must_have/nice_to_have-kompetenser
    så vi slipper en extra API-rundresa per jobb. Returnerar tom lista om
    sessionen saknar kompetenser eller AF inte hittar några annonser.
    """
    user_skills = set(await get_session_skill_ids(session))
    if not user_skills:
        log.info("match.jobs.empty_session", session=session)
        return []

    hits = await get_job_skill_ids(list(user_skills))
    if not hits:
        log.info("match.jobs.no_hits", session=session)
        return []

    enriched: list[dict[str, Any]] = []
    for hit in hits:
        skill_map, name_map = _extract_skill_map(hit)
        idf = {sid: 1.0 for sid in skill_map}
        score = calculate_fit_score(user_skills, skill_map, idf)
        summary = _summarize_hit(hit)
        if score is None:
            # Ingen jobbkompetensdata — visa hit men utan poäng (PRD TF-08).
            enriched.append(
                {
                    **summary,
                    "fit_score": None,
                    "confidence_interval": None,
                    "matched_skills": [],
                    "missing_required": [],
                    "missing_preferred": [],
                    "data_status": "ingen_kompetensdata",
                }
            )
            continue
        enriched.append(
            {
                **summary,
                "fit_score": score["score"],
                "confidence_interval": score["confidence_interval"],
                "matched_skills": [
                    name_map.get(s, s) for s in score["matched_required"]
                ],
                "missing_required": [
                    name_map.get(s, s) for s in score["missing_required"]
                ],
                "missing_preferred": [
                    name_map.get(s, s) for s in score["missing_preferred"]
                ],
                "data_status": "ok",
            }
        )

    enriched.sort(key=lambda j: (j["fit_score"] is None, -(j["fit_score"] or 0)))
    log.info(
        "match.jobs",
        session=session,
        skills=len(user_skills),
        hits=len(hits),
        scored=sum(1 for j in enriched if j["fit_score"] is not None),
    )
    return enriched


@router.get("/score")
async def fit_score(
    session: str = Query(..., min_length=1),
    job: str = Query(..., min_length=1),
):
    """Beräknar fit-poäng med Wilson score-konfidensintervall för ett specifikt jobb."""
    skill_ids = await get_session_skill_ids(session)
    job_skills, idf = await get_job_idf(job)
    result = calculate_fit_score(set(skill_ids), job_skills, idf)
    if result is None:
        log.info("match.score.no_data", session=session, job=job)
        raise HTTPException(
            status_code=404, detail="Jobbdata saknas eller inga kompetenser"
        )
    log.info(
        "match.score",
        session=session,
        job=job,
        score=result["score"],
        ci_low=result["confidence_interval"]["low"],
    )
    return result
