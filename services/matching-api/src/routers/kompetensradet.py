from fastapi import APIRouter, Query
from ..services.scb_client import get_brist_data, get_karta_data
from ..services.cache import get_with_swr, OCCUPATION_OVERVIEW_TTL, JOB_SEARCH_REVALIDATE_AFTER

router = APIRouter()

# Kända sektorer i Jönköpings läns arbetsmarknad.
# Källa: Kompetensrådets sektorsindelning (regionalt beslut 2023).
_SEKTORER = {
    "industri": "Industri och tillverkning",
    "vard": "Vård och omsorg",
    "it": "IT och digitalisering",
    "bygg": "Bygg och anläggning",
    "handel": "Handel och logistik",
    "utbildning": "Utbildning och forskning",
}


@router.get("/sektorer")
async def lista_sektorer() -> list[dict]:
    return [{"id": k, "namn": v} for k, v in _SEKTORER.items()]


@router.get("/sektorer/{sektor}")
async def sektor_info(sektor: str) -> dict:
    namn = _SEKTORER.get(sektor, sektor.replace("-", " ").capitalize())
    return {"id": sektor, "namn": namn}


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
async def omstallning(sektor: str = Query(default="alla")):
    cache_key = f"kompetensradet:omstallning:{sektor}"
    if sektor == "alla":
        return await get_with_swr(
            cache_key,
            _fetch_all_omstallning,
            OCCUPATION_OVERVIEW_TTL,
            JOB_SEARCH_REVALIDATE_AFTER,
        )
    return await get_with_swr(
        cache_key,
        lambda: get_brist_data(sektor),
        OCCUPATION_OVERVIEW_TTL,
        JOB_SEARCH_REVALIDATE_AFTER,
    )


async def _fetch_all_omstallning() -> list:
    result = []
    for sek in _SEKTORER:
        result.extend(await get_brist_data(sek))
    return result


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
    from fastapi.responses import Response
    pdf_bytes = await generate_pdf_report(sektor)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="rapport_{sektor}.pdf"'},
    )
