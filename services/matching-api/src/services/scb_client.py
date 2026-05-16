import httpx
import os
from typing import Any

_BASE = os.environ.get("SCB_API_BASE", "https://statistikdatabasen.scb.se/api/v2")
_LAN = os.environ.get("JONKOPING_LAN_CODE", "06")


async def get_brist_data(sektor: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{_BASE}/sv/AM/AM0208", params={"lan": _LAN, "sektor": sektor})
        if res.status_code == 404:
            return []
        res.raise_for_status()
        return res.json()


async def get_karta_data(sektor: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{_BASE}/sv/AM/AM0208/kommuner",
                               params={"lan": _LAN, "sektor": sektor})
        if res.status_code == 404:
            return []
        res.raise_for_status()
        return res.json()


async def calculate_roi(antal: int, kostnad_kr: float, sektor: str) -> dict:
    loneokning_kr = kostnad_kr * 0.15 * antal
    netto = loneokning_kr - (kostnad_kr * antal)
    roi = (netto / (kostnad_kr * antal) * 100) if kostnad_kr > 0 else 0.0
    payback = int((kostnad_kr * antal) / (loneokning_kr / 12)) if loneokning_kr > 0 else 0
    return {
        "roi_procent": round(roi, 1),
        "payback_manader": payback,
        "netto_vinst_kr": round(netto, 0),
        "antaganden": [
            "Antagen löneökning: 15% av utbildningskostnaden per år",
            f"Beräknat för {antal} deltagare i sektorn {sektor}",
            "Källa: SCB lönestatistik, genomsnittliga effekter kompetensutveckling",
        ],
    }


async def generate_pdf_report(sektor: str) -> bytes:
    brist = await get_brist_data(sektor)
    lines = [
        f"Kompetensrådet i Jönköpings län — Rapport: {sektor}".encode("utf-8"),
        b"",
        b"Bristyrken:",
    ]
    for rad in brist:
        namn = rad.get("occupation_name", "Okänt yrke")
        idx = rad.get("brist_index", 0)
        lines.append(f"  {namn}: {idx}".encode("utf-8"))
    return b"\n".join(lines)
