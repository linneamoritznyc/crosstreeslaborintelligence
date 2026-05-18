"""Kompetensrådet-router för Jönköpings län.

PRD KR-01–KR-12. Alla endpoints returnerar källmärkt data.
"""
from fastapi import APIRouter, Query
from fastapi.responses import Response

from ..services.cache import (
    JOB_SEARCH_REVALIDATE_AFTER,
    OCCUPATION_OVERVIEW_TTL,
    get_with_swr,
)
from ..services.jonkoping_geo import (
    SEKTORER,
    bygg_kartdata,
    list_sektorer,
    sektor_metadata,
)
from ..services.roi_service import calculate_roi_with_confidence
from ..services.scb_client import (
    generate_pdf_report,
    get_brist_data,
    get_karta_data,
)

router = APIRouter()


@router.get("/sektorer")
async def sektorer():
    """Lista över valbara sektorer för Kompetensrådet-flödet."""
    return list_sektorer()


@router.get("/sektorer/{sektor}")
async def sektor_info(sektor: str):
    meta = sektor_metadata(sektor)
    if meta is None:
        return {"namn": sektor, "kallor": []}
    return meta


@router.get("/brist")
async def brist_yrken(sektor: str = Query(...)):
    """Bristyrken per sektor — AF Platsbanken-derivat via SCB AM0208."""
    return await get_with_swr(
        f"kompetensradet:brist:{sektor}",
        lambda: get_brist_data(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/karta")
async def karta_data(sektor: str = Query(...)):
    """Kommundata för D3-choropleth.

    Bygger på faktiska kommun-centroider (SCB Geodata RegSO 2025) berikade
    med bristindex per kommun från AM0208. Inga fabricerade polygoner.
    """
    async def _fetch():
        raw = await get_karta_data(sektor)
        return bygg_kartdata(raw, sektor)

    return await get_with_swr(
        f"kompetensradet:karta:{sektor}",
        _fetch,
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/omstallning")
async def omstallning(sektor: str = Query("alla")):
    return await get_with_swr(
        f"kompetensradet:omstallning:{sektor}",
        lambda: get_brist_data(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/roi")
async def roi_kalkyl(
    antal_deltagare: int = Query(..., gt=0, le=10_000),
    utbildningskostnad_kr: float = Query(..., ge=0, le=1_000_000),
    sektor: str = Query(...),
    transition_score: float = Query(0.85, ge=0.0, le=1.0),
):
    """ROI-kalkyl med bootstrap-konfidensintervall enligt PRD KR-05."""
    result = calculate_roi_with_confidence(
        participants=antal_deltagare,
        training_cost_per_person=utbildningskostnad_kr,
        transition_score=transition_score,
    )
    result["sektor"] = sektor
    result["sektor_namn"] = (
        SEKTORER[sektor]["namn"] if sektor in SEKTORER else sektor
    )
    return result


@router.get("/export/pdf")
async def export_pdf(sektor: str = Query(...)):
    pdf_bytes = await generate_pdf_report(sektor)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="rapport_{sektor}.pdf"'
        },
    )
