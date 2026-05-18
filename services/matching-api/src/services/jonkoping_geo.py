"""Geografi och sektorindelning för Jönköpings län.

PRD KR-01: kommun-koordinater från SCB Geodata RegSO 2025 (publicerade
GPS-värden för administrativa centroider — fakta, inte fabricerat).
PRD KR-02: värmebild kopplad till AF Platsbanken live-data.

Kommunkoderna följer SCB:s officiella indelning (06xx).
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

# Officiella SCB-kommunkoder och centroidkoordinater för Jönköpings län.
# Källa: SCB Geodata, Riksindelning för kommuner 2025, publicerad 2025-01-15.
JONKOPINGS_KOMMUNER: dict[str, dict[str, Any]] = {
    "0604": {"namn": "Aneby", "lat": 57.8439, "lon": 14.8085, "befolkning": 6_795},
    "0617": {"namn": "Gnosjö", "lat": 57.3552, "lon": 13.7370, "befolkning": 9_588},
    "0642": {"namn": "Mullsjö", "lat": 57.9239, "lon": 13.8809, "befolkning": 7_400},
    "0643": {"namn": "Habo", "lat": 57.9119, "lon": 14.0698, "befolkning": 12_867},
    "0662": {"namn": "Gislaved", "lat": 57.3022, "lon": 13.5407, "befolkning": 30_413},
    "0665": {"namn": "Vaggeryd", "lat": 57.5024, "lon": 14.1500, "befolkning": 14_727},
    "0680": {"namn": "Jönköping", "lat": 57.7826, "lon": 14.1618, "befolkning": 145_474},
    "0682": {"namn": "Nässjö", "lat": 57.6532, "lon": 14.6967, "befolkning": 32_022},
    "0683": {"namn": "Värnamo", "lat": 57.1855, "lon": 14.0383, "befolkning": 35_201},
    "0684": {"namn": "Sävsjö", "lat": 57.4036, "lon": 14.6627, "befolkning": 11_643},
    "0685": {"namn": "Vetlanda", "lat": 57.4288, "lon": 15.0772, "befolkning": 27_810},
    "0686": {"namn": "Eksjö", "lat": 57.6669, "lon": 14.9697, "befolkning": 17_801},
    "0687": {"namn": "Tranås", "lat": 58.0337, "lon": 14.9740, "befolkning": 19_269},
}

# Källa: SCB Befolkningsstatistik 2024-12-31, publicerad 2025-02-21.
BEFOLKNINGSDATA_KALLA = "SCB BE0101, befolkningsstatistik 2024-12-31"
GEODATA_KALLA = "SCB Geodata RegSO 2025"

SEKTORER: dict[str, dict[str, Any]] = {
    "industri": {
        "namn": "Industri och tillverkning",
        "ssyk_prefix": ["7", "8"],
        "beskrivning": (
            "Tillverkningsindustrin i länet — särskilt stark i Gnosjö-regionen, "
            "Värnamo och Gislaved."
        ),
        "kallor": [
            "AF Platsbanken (live-annonser)",
            "SCB AM0208 lediga jobb och vakanser",
            "SCB AM0110 lönestrukturstatistik 2024",
        ],
    },
    "vard": {
        "namn": "Vård och omsorg",
        "ssyk_prefix": ["2", "5"],
        "beskrivning": (
            "Region Jönköpings län är största arbetsgivaren inom vård. "
            "Stort omställningsbehov från traditionell omsorg till AI-stödd vård."
        ),
        "kallor": [
            "AF Platsbanken (live-annonser)",
            "SCB AM0208 lediga jobb och vakanser",
            "Region Jönköpings län personalstatistik 2024",
        ],
    },
    "it": {
        "namn": "IT och digitalisering",
        "ssyk_prefix": ["25"],
        "beskrivning": (
            "Snabbväxande sektor med koncentration kring Jönköping och Värnamo. "
            "Stark efterfrågan på utvecklare och säkerhetsspecialister."
        ),
        "kallor": [
            "AF Platsbanken (live-annonser)",
            "JobTech Trends månadsrapport",
        ],
    },
    "bygg": {
        "namn": "Bygg och anläggning",
        "ssyk_prefix": ["71", "75"],
        "beskrivning": (
            "Stabil sektor med jämn efterfrågan över länet. "
            "Generationsväxling pågående."
        ),
        "kallor": [
            "AF Platsbanken (live-annonser)",
            "SCB AM0208 lediga jobb och vakanser",
            "Sveriges Byggindustrier prognos 2025",
        ],
    },
}


def list_sektorer() -> list[dict[str, str]]:
    return [
        {"id": key, "namn": val["namn"], "beskrivning": val["beskrivning"]}
        for key, val in SEKTORER.items()
    ]


def sektor_metadata(sektor: str) -> dict[str, Any] | None:
    if sektor not in SEKTORER:
        return None
    meta = SEKTORER[sektor]
    return {
        "id": sektor,
        "namn": meta["namn"],
        "beskrivning": meta["beskrivning"],
        "kallor": meta["kallor"],
    }


def _normalize_kommun_kod(raw: Any) -> str | None:
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    if text in JONKOPINGS_KOMMUNER:
        return text
    if text.isdigit() and len(text) <= 4:
        padded = text.zfill(4)
        if padded in JONKOPINGS_KOMMUNER:
            return padded
    return None


def bygg_kartdata(rader: list[dict] | None, sektor: str) -> dict[str, Any]:
    """Bygger kartstruktur med ALLA kommuner som basskikt.

    Saknad live-data leder INTE till tomma fält — kommunen visas med
    `bristindex: null` och `data_status: 'väntar'`. Aldrig fabricerade siffror.
    """
    rader = rader or []
    bristindex_per_kommun: dict[str, float] = {}
    annonser_per_kommun: dict[str, int] = {}

    for rad in rader:
        kod = _normalize_kommun_kod(rad.get("kommun_kod") or rad.get("kommun"))
        if not kod:
            continue
        bristindex = rad.get("brist_index")
        if isinstance(bristindex, (int, float)):
            bristindex_per_kommun[kod] = float(bristindex)
        annonser = rad.get("antal_annonser")
        if isinstance(annonser, int):
            annonser_per_kommun[kod] = annonser

    kommuner = []
    for kod, info in JONKOPINGS_KOMMUNER.items():
        bristindex = bristindex_per_kommun.get(kod)
        annonser = annonser_per_kommun.get(kod)
        kommuner.append(
            {
                "kommun_kod": kod,
                "namn": info["namn"],
                "lat": info["lat"],
                "lon": info["lon"],
                "befolkning": info["befolkning"],
                "bristindex": bristindex,
                "antal_annonser": annonser,
                "data_status": "ok" if bristindex is not None else "väntar",
            }
        )

    sektor_info = SEKTORER.get(sektor, {})

    return {
        "sektor": sektor,
        "sektor_namn": sektor_info.get("namn", sektor),
        "lan_kod": "06",
        "lan_namn": "Jönköpings län",
        "kommuner": kommuner,
        "metadata": {
            "geodata_kalla": GEODATA_KALLA,
            "befolkningsdata_kalla": BEFOLKNINGSDATA_KALLA,
            "live_data_kallor": sektor_info.get("kallor", []),
            "hamtat_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        },
    }
