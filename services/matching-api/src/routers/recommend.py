from fastapi import APIRouter, Query
from ..services.graph import get_career_graph, get_gaps

router = APIRouter()


@router.get("/career-graph")
async def career_graph(session: str = Query(...)):
    return await get_career_graph(session)


@router.get("/gaps")
async def skill_gaps(
    session: str = Query(...),
    target: str = Query(...),
):
    return await get_gaps(session, target)
