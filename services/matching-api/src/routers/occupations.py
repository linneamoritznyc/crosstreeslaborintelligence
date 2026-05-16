from fastapi import APIRouter, Query
from ..services.af_taxonomy import get_occupation
from ..services.cache import get_with_swr, OCCUPATION_OVERVIEW_TTL, JOB_SEARCH_REVALIDATE_AFTER

router = APIRouter()


@router.get("/")
async def list_occupations(q: str = Query(default="", max_length=100)):
    return await get_with_swr(
        f"occupations:list:{q}",
        lambda: get_occupation(q),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/{occupation_id}")
async def get_occupation_detail(occupation_id: str):
    return await get_with_swr(
        f"occupations:detail:{occupation_id}",
        lambda: get_occupation(occupation_id),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )
