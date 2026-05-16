from fastapi import APIRouter, Query
from ..services.af_jobsearch import search_jobs, get_job_detail
from ..services.cache import get_with_swr, JOB_SEARCH_SERVE_TTL, JOB_SEARCH_REVALIDATE_AFTER

router = APIRouter()


@router.get("/")
async def list_jobs(q: str = Query(default="", max_length=200)):
    return await get_with_swr(
        f"jobs:search:{q}",
        lambda: search_jobs(q),
        JOB_SEARCH_SERVE_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/{job_id}")
async def job_detail(job_id: str):
    return await get_with_swr(
        f"jobs:detail:{job_id}",
        lambda: get_job_detail(job_id),
        JOB_SEARCH_SERVE_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )
