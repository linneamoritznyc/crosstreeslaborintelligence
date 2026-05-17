"""Matchningsendpunkter: rankade jobblista och detaljerad fit-poäng.

Returnerar None/tom lista vid saknad data — aldrig fabricerade poäng.
Wilson score 95% CI krävs på alla matchningspoäng (EU AI Act Artikel 13).
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..middleware.logging import get_logger
from ..services.af_jobsearch import get_job_idf, get_job_skill_ids
from ..services.embeddings import get_session_skill_ids
from ..services.fit_score import calculate_fit_score

log = get_logger(__name__)
router = APIRouter()


@router.get("/jobs")
async def matched_jobs(session: str = Query(..., min_length=1)):
    """Returnerar jobbannonser rankade mot CV-sessionens kompetenser."""
    skill_ids = await get_session_skill_ids(session)
    if not skill_ids:
        log.info("match.jobs.empty_session", session=session)
        return []
    hits = await get_job_skill_ids(skill_ids)
    log.info("match.jobs", session=session, skills=len(skill_ids), hits=len(hits))
    return hits


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
        raise HTTPException(status_code=404, detail="Jobbdata saknas eller inga kompetenser")
    log.info(
        "match.score",
        session=session,
        job=job,
        score=result["score"],
        ci_low=result["confidence_interval"]["low"],
    )
    return result
