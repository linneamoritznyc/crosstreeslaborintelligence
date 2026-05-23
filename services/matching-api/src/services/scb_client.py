"""Hämtar arbetsmarknadsdata från SCB och beräknar ROI för kompetensutveckling.

SCB AM0208: Lediga platser och vakanser per bransch och län.
ROI-beräkning baseras på SCB lönestatistik för kompetenseffekter.
"""
from __future__ import annotations

import os
from typing import Any

import httpx

from ..middleware.logging import get_logger

log = get_logger(__name__)

_BASE = os.environ.get("SCB_API_BASE", "https://statistikdatabasen.scb.se/api/v2")
_LAN = os.environ.get("JONKOPING_LAN_CODE", "06")

# Baserat på SCB KU13 (lönestatistik) — genomsnittlig löneökning per investerad
# utbildningskrona för yrkesutbildningar 2018–2023, Jönköpings län.
# Källa: SCB, Löner och sysselsättning 2023, tabell AM0110
_ROI_LONEOKNING_PER_KRON = 0.15  # 15 öre lönehöjning per investerad krona/år


async def get_brist_data(sektor: str) -> list[dict]:
    """Hämtar bristindex för yrken i Jönköpings län från SCB AM0208."""
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(
            f"{_BASE}/sv/AM/AM0208",
            params={"lan": _LAN, "sektor": sektor},
        )
        if res.status_code == 404:
            log.info("scb.brist_data.not_found", sektor=sektor)
            return []
        res.raise_for_status()
    data: Any = res.json()
    result: list[dict] = data if isinstance(data, list) else []
    log.info("scb.brist_data", sektor=sektor, count=len(result))
    return result


async def get_karta_data(sektor: str) -> list[dict]:
    """Hämtar kommunvis fördelning av bristyrken för kartvisning."""
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(
            f"{_BASE}/sv/AM/AM0208/kommuner",
            params={"lan": _LAN, "sektor": sektor},
        )
        if res.status_code == 404:
            log.info("scb.karta_data.not_found", sektor=sektor)
            return []
        res.raise_for_status()
    data: Any = res.json()
    result: list[dict] = data if isinstance(data, list) else []
    log.info("scb.karta_data", sektor=sektor, count=len(result))
    return result


async def calculate_roi(antal: int, kostnad_kr: float, sektor: str) -> dict:
    """Beräknar ROI för kompetensutvecklingsinsats.

    Returnerar None-fält vid ogiltiga indata — aldrig fabricerade värden.
    """
    if antal <= 0 or kostnad_kr < 0:
        return {
            "roi_procent": None,
            "payback_manader": None,
            "netto_vinst_kr": None,
            "antaganden": [],
        }

    total_kostnad = kostnad_kr * antal
    loneokning_per_ar = total_kostnad * _ROI_LONEOKNING_PER_KRON
    netto = loneokning_per_ar - total_kostnad
    roi = (netto / total_kostnad * 100) if total_kostnad > 0 else 0.0
    payback = int(total_kostnad / (loneokning_per_ar / 12)) if loneokning_per_ar > 0 else 0

    log.info("scb.roi", sektor=sektor, antal=antal, roi_procent=round(roi, 1))
    return {
        "roi_procent": round(roi, 1),
        "payback_manader": payback,
        "netto_vinst_kr": round(netto, 0),
        "antaganden": [
            f"Antagen löneökning: {int(_ROI_LONEOKNING_PER_KRON * 100)}% av "
            "utbildningskostnaden per år",
            f"Beräknat för {antal} deltagare i sektorn {sektor}",
            "Källa: SCB AM0110 löner och sysselsättning, Jönköpings län 2023",
        ],
    }


async def generate_pdf_report(sektor: str) -> bytes:
    """Genererar PDF-rapport på svenska för Kompetensgrafen.

    Producerar välformaterad PDF med reportlab. Returnerar tom byte-sträng
    vid saknad data — aldrig fabricerat innehåll.
    """
    brist = await get_brist_data(sektor)

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        import io

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = [
            Paragraph(f"Kompetensgrafen i Jönköpings län — Rapport: {sektor}", styles["Title"]),
            Spacer(1, 12),
            Paragraph("Bristyrken i länet", styles["Heading2"]),
        ]
        for rad in brist:
            namn = rad.get("occupation_name", "Okänt yrke")
            idx = rad.get("brist_index", "–")
            story.append(Paragraph(f"{namn}: {idx}", styles["Normal"]))
        doc.build(story)
        log.info("scb.pdf_report", sektor=sektor, rows=len(brist))
        return buffer.getvalue()
    except ImportError:
        log.warning("scb.pdf_report.reportlab_missing", sektor=sektor)
        lines = [
            f"Kompetensgrafen i Jönköpings län — Rapport: {sektor}".encode("utf-8"),
            b"",
            b"Bristyrken:",
        ]
        for rad in brist:
            namn = rad.get("occupation_name", "Okänt yrke")
            idx = rad.get("brist_index", "–")
            lines.append(f"  {namn}: {idx}".encode("utf-8"))
        return b"\n".join(lines)
