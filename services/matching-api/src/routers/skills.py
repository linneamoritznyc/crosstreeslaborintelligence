from fastapi import APIRouter, Query
from ..services.af_taxonomy import get_skills
from ..services.cache import get_with_swr, TAXONOMY_TTL, JOB_SEARCH_REVALIDATE_AFTER

router = APIRouter()


@router.get("/")
async def list_skills(q: str = Query(default="", max_length=100)):
    return await get_with_swr(
        f"skills:list:{q}",
        lambda: get_skills(q),
        TAXONOMY_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )
