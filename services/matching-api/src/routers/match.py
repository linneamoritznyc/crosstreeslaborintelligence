from fastapi import APIRouter, Query
from ..services.fit_score import calculate_fit_score
from ..services.embeddings import get_session_skill_ids
from ..services.af_jobsearch import get_job_skill_ids, get_job_idf

router = APIRouter()


@router.get("/jobs")
async def matched_jobs(session: str = Query(...)):
    skill_ids = await get_session_skill_ids(session)
    return await get_job_skill_ids(skill_ids)


@router.get("/score")
async def fit_score(session: str = Query(...), job: str = Query(...)):
    skill_ids = await get_session_skill_ids(session)
    job_skills, idf = await get_job_idf(job)
    result = calculate_fit_score(set(skill_ids), job_skills, idf)
    if result is None:
        return {"error": "Jobbdata saknas"}
    return result
