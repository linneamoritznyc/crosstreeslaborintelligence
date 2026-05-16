from fastapi import APIRouter, Query
from ..services.scb_client import get_brist_data, get_karta_data
from ..services.fit_score import calculate_fit_score
from ..services.cache import get_with_swr, OCCUPATION_OVERVIEW_TTL, JOB_SEARCH_REVALIDATE_AFTER

router = APIRouter()


@router.get("/sektorer/{sektor}")
async def sektor_info(sektor: str):
    return await get_with_swr(
        f"kompetensradet:sektor:{sektor}",
        lambda: get_brist_data(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/brist")
async def brist_yrken(sektor: str = Query(...)):
    return await get_with_swr(
        f"kompetensradet:brist:{sektor}",
        lambda: get_brist_data(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/karta")
async def karta_data(sektor: str = Query(...)):
    return await get_with_swr(
        f"kompetensradet:karta:{sektor}",
        lambda: get_karta_data(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/omstallning")
async def omstallning():
    return await get_with_swr(
        "kompetensradet:omstallning",
        lambda: get_brist_data("omstallning"),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/roi")
async def roi_kalkyl(
    antal_deltagare: int = Query(..., gt=0),
    utbildningskostnad_kr: float = Query(..., ge=0),
    sektor: str = Query(...),
):
    from ..services.scb_client import calculate_roi
    return await calculate_roi(antal_deltagare, utbildningskostnad_kr, sektor)


@router.get("/export/pdf")
async def export_pdf(sektor: str = Query(...)):
    from ..services.scb_client import generate_pdf_report
    pdf_bytes = await generate_pdf_report(sektor)
    from fastapi.responses import Response
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="rapport_{sektor}.pdf"'})
