"""Kompetensgrafen-router — Neo4j + AF Platsbanken som primära källor.

PDF-export, ROI-kalkyl och karta delegeras till dedikerade service-moduler.
Alla endpunkter degraderar enligt matrisen om beroenden saknas.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from ..middleware.logging import get_logger
from ..services.cache import (
    JOB_SEARCH_REVALIDATE_AFTER,
    OCCUPATION_OVERVIEW_TTL,
    get_with_swr,
)
from ..services.kompetensgrafen_geo import get_karta_for_sektor
from ..services.kompetensgrafen_roi import calculate_roi, generate_pdf_report
from ..services.kompetensgrafen_service import (
    get_brist_for_sektor,
    get_omstallning,
    get_sector_stats,
    get_top_shortage_occupations,
    list_occupations_for_sektor,
)
from ..services.natverk_service import hamta_natverk

log = get_logger(__name__)
router = APIRouter()

_GILTIGA_SEKTORER = {
    "industri",
    "vard",
    "it",
    "bygg",
    "logistik",
    "service",
    "utbildning",
}

_SEKTOR_NAMN = {
    "industri": "Tillverkning och industri",
    "vard": "Vård och omsorg",
    "it": "IT och digitalisering",
    "bygg": "Bygg och anläggning",
    "logistik": "Logistik och transport",
    "service": "Service och handel",
    "utbildning": "Utbildning",
}


def _validera(sektor: str) -> None:
    if sektor not in _GILTIGA_SEKTORER:
        raise HTTPException(status_code=404, detail=f"Okänd sektor: {sektor}")


@router.get("/sektorer/{sektor}")
async def sektor_info(sektor: str):
    _validera(sektor)
    return {"namn": _SEKTOR_NAMN[sektor], "id": sektor}


@router.get("/sektorer")
async def lista_sektorer():
    return [{"id": k, "namn": v} for k, v in _SEKTOR_NAMN.items()]


@router.get("/sector-stats")
async def sector_stats(sektor: str = Query(...)):
    _validera(sektor)
    return await get_sector_stats(sektor)


@router.get("/top-shortage-occupations")
async def top_shortage_occupations(sektor: str = Query(...)):
    _validera(sektor)
    return await get_top_shortage_occupations(sektor)


@router.get("/brist")
async def brist_yrken(sektor: str = Query(...)):
    _validera(sektor)
    return await get_with_swr(
        f"kompetensgrafen:brist:{sektor}",
        lambda: get_brist_for_sektor(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/karta")
async def karta_data(sektor: str = Query(...)):
    _validera(sektor)
    return await get_with_swr(
        f"kompetensgrafen:karta:{sektor}",
        lambda: get_karta_for_sektor(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/natverk")
async def natverk(annonser: bool = Query(default=True)):
    """Hela kompetensnätverket: yrken som noder, substituerbarhet som kanter.

    `meta` beskriver datans faktiska omfång och vilka fält som saknas, så att
    gränssnittet kan visa verkliga tal i stället för uppskattningar.
    """
    return await get_with_swr(
        f"kompetensgrafen:natverk:{int(annonser)}",
        lambda: hamta_natverk(inkludera_annonser=annonser),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


@router.get("/omstallning")
async def omstallning(target: str | None = Query(default=None)):
    return await get_omstallning(target)


@router.get("/yrken")
async def yrken_i_sektor(sektor: str = Query(...)):
    _validera(sektor)
    return await list_occupations_for_sektor(sektor)


@router.get("/roi")
async def roi_kalkyl(
    antal_deltagare: int = Query(..., gt=0),
    utbildningskostnad_kr: float = Query(..., ge=0),
    sektor: str = Query(...),
):
    _validera(sektor)
    return await calculate_roi(antal_deltagare, utbildningskostnad_kr, sektor)


@router.get("/export/pdf")
async def export_pdf(sektor: str = Query(...)):
    _validera(sektor)
    pdf_bytes = await generate_pdf_report(sektor)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="rapport_{sektor}.pdf"'},
    )
