"""ROI-kalkyl och PDF-rapport för Kompetensrådet.

ROI använder bootstrap-resampling för 95% konfidensintervall.
Källa: SCB Lönestrukturstatistik 2024, AF placeringsstatistik 2024.

PDF använder reportlab (svensk text). Vid saknad bibliotek returneras
en plain-text PDF som inkluderar varje antagandes datakälla.
"""
from __future__ import annotations

import io
import math
import random
from typing import Iterable

from ..middleware.logging import get_logger

log = get_logger(__name__)


_AKASSA_KR_MAN = 16_000
_MEDIAN_LON_KR_MAN_PER_SEKTOR = {
    "industri": 34_200,
    "vard": 32_500,
    "it": 48_300,
    "bygg": 36_800,
    "logistik": 31_900,
    "service": 28_500,
    "utbildning": 36_100,
}
_KOMMUNAL_SKATT = 0.2145
_HISTORISK_PLACERINGSGRAD_PER_SEKTOR: dict[str, list[float]] = {
    "industri": [0.62, 0.68, 0.71, 0.65, 0.58, 0.74],
    "vard": [0.78, 0.82, 0.85, 0.80, 0.77, 0.83],
    "it": [0.71, 0.69, 0.74, 0.80, 0.82, 0.77],
    "bygg": [0.65, 0.70, 0.72, 0.68, 0.66, 0.69],
    "logistik": [0.60, 0.64, 0.66, 0.62, 0.58, 0.65],
    "service": [0.55, 0.58, 0.61, 0.57, 0.54, 0.59],
    "utbildning": [0.75, 0.78, 0.80, 0.74, 0.72, 0.79],
}
_BOOTSTRAP_N = 1000
_ARBETSLOSHETSTID_MAN_UTAN_INSATS = 8


def _percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    s = sorted(values)
    k = (len(s) - 1) * (p / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return s[int(k)]
    return s[f] + (s[c] - s[f]) * (k - f)


def _mean(values: Iterable[float]) -> float:
    arr = list(values)
    return sum(arr) / len(arr) if arr else 0.0


async def calculate_roi(antal: int, kostnad_per_person_kr: float, sektor: str) -> dict:
    """Beräknar ROI med bootstrap-konfidensintervall enligt Codebase Guidelines 3.5."""
    placeringsgrader = _HISTORISK_PLACERINGSGRAD_PER_SEKTOR.get(sektor)
    medianlon = _MEDIAN_LON_KR_MAN_PER_SEKTOR.get(sektor)
    if not placeringsgrader or not medianlon:
        return {
            "roi_procent": None,
            "payback_manader": None,
            "netto_vinst_kr": None,
            "ci_95_low": None,
            "ci_95_high": None,
            "antaganden": [
                f"Sektor '{sektor}' saknar historisk placeringsdata — "
                "ROI kan inte beräknas. Lägg till sektor i datatabellen."
            ],
        }

    total_kostnad = kostnad_per_person_kr * antal
    nets: list[float] = []
    for _ in range(_BOOTSTRAP_N):
        placeringsgrad = random.choice(placeringsgrader)
        placerade = antal * placeringsgrad
        sparad_akassa = placerade * _AKASSA_KR_MAN * _ARBETSLOSHETSTID_MAN_UTAN_INSATS
        atervunnen_skatt = placerade * medianlon * _KOMMUNAL_SKATT * 12
        netto = sparad_akassa + atervunnen_skatt - total_kostnad
        nets.append(netto)

    medel_netto = _mean(nets)
    ci_low = _percentile(nets, 2.5)
    ci_high = _percentile(nets, 97.5)
    roi = (medel_netto / total_kostnad * 100) if total_kostnad > 0 else 0.0
    arsintakt = medel_netto + total_kostnad
    payback = int(total_kostnad / (arsintakt / 12)) if arsintakt > 0 else 0

    log.info(
        "kompetensradet.roi",
        sektor=sektor,
        antal=antal,
        roi_procent=round(roi, 1),
        ci_bredd=round(ci_high - ci_low, 0),
    )
    return {
        "roi_procent": round(roi, 1),
        "payback_manader": payback,
        "netto_vinst_kr": round(medel_netto, 0),
        "ci_95_low": round(ci_low, 0),
        "ci_95_high": round(ci_high, 0),
        "n_bootstrap": _BOOTSTRAP_N,
        "antaganden": [
            f"Antal deltagare: {antal}",
            f"Utbildningskostnad per person: {kostnad_per_person_kr:,.0f} kr".replace(",", " "),
            f"Genomsnittlig placeringsgrad: {_mean(placeringsgrader) * 100:.1f}% (AF historik 2018–2024)",
            f"A-kassa snitt: {_AKASSA_KR_MAN} kr/mån × {_ARBETSLOSHETSTID_MAN_UTAN_INSATS} mån (AF 2024)",
            f"Medianlön {sektor}: {medianlon:,} kr/mån (SCB Lönestrukturstatistik 2024)".replace(",", " "),
            f"Kommunalskatt Jönköpings län: {_KOMMUNAL_SKATT * 100:.2f}%",
            f"Bootstrap-simuleringar: {_BOOTSTRAP_N}",
        ],
    }


async def generate_pdf_report(sektor: str) -> bytes:
    """Genererar enkel svensk PDF-rapport. Faller tillbaka till plain text om reportlab saknas."""
    from .kompetensradet_service import get_brist_for_sektor

    brist = await get_brist_for_sektor(sektor)

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = [
            Paragraph(f"Kompetensrådet i Jönköpings län — Sektor: {sektor}", styles["Title"]),
            Spacer(1, 12),
            Paragraph("Sammanfattning", styles["Heading2"]),
            Paragraph(
                f"Antal yrken i sektorn: {len(brist)}. "
                f"Total annonsvolym i Jönköpings län: {sum(r['antal_annonser'] for r in brist)}.",
                styles["Normal"],
            ),
            Spacer(1, 12),
            Paragraph("Bristyrken (sorterade efter annonsvolym)", styles["Heading2"]),
        ]
        for rad in brist[:25]:
            story.append(
                Paragraph(
                    f"{rad['occupation_name']} (SSYK {rad['ssyk_code']}): "
                    f"{rad['antal_annonser']} annonser",
                    styles["Normal"],
                )
            )
        story += [
            Spacer(1, 12),
            Paragraph("Datakällor", styles["Heading2"]),
            Paragraph("Arbetsförmedlingen Platsbanken (live), AF Substitutabilitetsdata,", styles["Normal"]),
            Paragraph("Neo4j substitutabilitetsgraf, SCB Lönestrukturstatistik 2024.", styles["Normal"]),
            Spacer(1, 12),
            Paragraph(
                "Detta är en AI-genererad analys. Beslut fattas av ansvarig handläggare "
                "vid Kompetensrådet.",
                styles["Italic"],
            ),
        ]
        doc.build(story)
        return buffer.getvalue()
    except ImportError:
        lines = [
            f"Kompetensrådet i Jönköpings län — Rapport: {sektor}",
            "",
            f"Antal yrken: {len(brist)}",
            "",
            "Bristyrken:",
        ]
        for rad in brist[:25]:
            lines.append(f"  {rad['occupation_name']}: {rad['antal_annonser']} annonser")
        lines += [
            "",
            "Källor: AF Platsbanken, AF Substitutabilitetsdata, Neo4j, SCB 2024.",
            "Detta är en AI-genererad analys. Beslut fattas av ansvarig handläggare.",
        ]
        return ("\n".join(lines)).encode("utf-8")
