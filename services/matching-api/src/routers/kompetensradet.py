"""Kompetensrådet-endpunkter: bristanalys, karta, omställning, ROI, PDF, översikt."""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, Query
from fastapi.responses import Response

from ..middleware.logging import get_logger
from ..services.cache import get_with_swr, OCCUPATION_OVERVIEW_TTL, JOB_SEARCH_REVALIDATE_AFTER
from ..services.scb_client import calculate_roi, generate_pdf_report, get_brist_data, get_karta_data
from ..services.trends_client import get_trends

log = get_logger(__name__)
router = APIRouter()

_SEKTORER = [
    {"sektor": "industri", "namn": "Industri"},
    {"sektor": "vård", "namn": "Vård och omsorg"},
    {"sektor": "it", "namn": "IT och digitalisering"},
    {"sektor": "bygg", "namn": "Bygg och anläggning"},
    {"sektor": "transport", "namn": "Transport och logistik"},
    {"sektor": "handel", "namn": "Handel"},
]


@router.get("/region/jonkoping/overview")
async def region_overview():
    """Aggregerad regional översikt — alla sektorer parallellt, cachad 4 h."""
    return await get_with_swr(
        "kompetensradet:overview:jonkoping",
        _fetch_overview,
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


async def _fetch_overview() -> dict:
    results = await asyncio.gather(
        *[get_trends(s["sektor"]) for s in _SEKTORER],
        return_exceptions=True,
    )
    sektorer = []
    totalt = 0
    for meta, result in zip(_SEKTORER, results):
        if isinstance(result, Exception):
            log.warning("overview.sektor_failed", sektor=meta["sektor"], fel=str(result))
            sektorer.append({**meta, "antal_annonser": 0, "toppyrken": []})
        else:
            antal = result.get("antal_annonser", 0)
            totalt += antal
            sektorer.append({
                **meta,
                "antal_annonser": antal,
                "toppyrken": result.get("toppyrken", [])[:3],
            })
    log.info("overview.done", totalt=totalt, sektorer=len(sektorer))
    return {
        "region": "Jönköpings län",
        "lan_kod": "06",
        "totalt_annonser": totalt,
        "sektorer": sektorer,
    }


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
    return await calculate_roi(antal_deltagare, utbildningskostnad_kr, sektor)


@router.get("/export/pdf")
async def export_pdf(sektor: str = Query(...)):
    pdf_bytes = await generate_pdf_report(sektor)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="rapport_{sektor}.pdf"'},
    )
