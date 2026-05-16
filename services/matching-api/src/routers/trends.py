from fastapi import APIRouter, Query
from ..services.trends_client import get_trends
from ..services.cache import get_with_swr, OCCUPATION_OVERVIEW_TTL, JOB_SEARCH_REVALIDATE_AFTER

router = APIRouter()


@router.get("/")
async def trends(sektor: str = Query(...)):
    return await get_with_swr(
        f"trends:{sektor}",
        lambda: get_trends(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )
