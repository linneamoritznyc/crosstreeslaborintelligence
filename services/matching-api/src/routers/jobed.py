from fastapi import APIRouter, Query
from ..services.jobed_client import get_education_suggestions
from ..services.cache import get_with_swr, OCCUPATION_OVERVIEW_TTL, JOB_SEARCH_REVALIDATE_AFTER

router = APIRouter()


@router.get("/utbildningar")
async def education_suggestions(
    occupation_id: str = Query(...),
    lan: str = Query(default="06"),
):
    return await get_with_swr(
        f"jobed:utbildningar:{occupation_id}:{lan}",
        lambda: get_education_suggestions(occupation_id, lan),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )
