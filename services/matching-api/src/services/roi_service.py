"""ROI-beräkning för kompetensutvecklingsinsatser med bootstrap-konfidensintervall.

PRD KR-05: bootstrap-CI, aldrig punktestimat.
Codebase guidelines 3.5: ingen statistisk beräkning utan osäkerhetsintervall.

Grunddata:
- A-kasseutbetalning i Jönköpings län 2024: 16 000 kr/månad x 8 mån snittlängd
- Medianlön Jönköpings län 2024 (SCB AM0110): 38 500 kr/månad
- Kommunalskatt Jönköpings län 2024 (genomsnitt): 21,45%
- Historisk placeringsgrad efter YH-utbildning 2018-2024 (MYH årsrapporter):
  bootstrap-sampling från dokumenterade årtal
"""
from __future__ import annotations

import os
import random
from statistics import mean
from typing import Sequence

from ..middleware.logging import get_logger

log = get_logger(__name__)

# Historiska placeringsgrader från MYH årsrapporter (2018-2024).
# Källa: Myndigheten för yrkeshögskolan, "Yrkeshögskolan — årsrapport"
# https://www.myh.se/publikationer
_HISTORICAL_PLACEMENT_RATES: tuple[float, ...] = (
    0.92, 0.93, 0.89, 0.84, 0.87, 0.91, 0.93,
)

_AKASSA_MANADSBELOPP_KR = 16_000
_AKASSA_SNITT_MANADER = 8
_MEDIANLON_KR = 38_500
_KOMMUNALSKATT_ANDEL = 0.2145

ALGORITHM_VERSION = os.environ.get("ALGORITHM_VERSION", "roi_bootstrap_v1.0")


def _percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    sorted_values = sorted(values)
    k = (len(sorted_values) - 1) * (p / 100)
    f = int(k)
    c = min(f + 1, len(sorted_values) - 1)
    if f == c:
        return sorted_values[f]
    return sorted_values[f] + (sorted_values[c] - sorted_values[f]) * (k - f)


def calculate_roi_with_confidence(
    participants: int,
    training_cost_per_person: float,
    transition_score: float = 1.0,
    historical_placements: Sequence[float] = _HISTORICAL_PLACEMENT_RATES,
    n_bootstrap: int = 1000,
    rng_seed: int | None = None,
) -> dict:
    """Bootstrap-baserad ROI med 95% konfidensintervall.

    Returnerar None-värden vid ogiltiga indata — aldrig fabricerade värden.
    """
    if participants <= 0 or training_cost_per_person < 0:
        return {
            "net_benefit_kr": None,
            "ci_95_low_kr": None,
            "ci_95_high_kr": None,
            "roi_procent": None,
            "payback_manader": None,
            "n_simulations": 0,
            "antaganden": [],
            "method": "bootstrap_95",
            "algorithm_version": ALGORITHM_VERSION,
        }

    if not historical_placements:
        return {
            "net_benefit_kr": None,
            "ci_95_low_kr": None,
            "ci_95_high_kr": None,
            "roi_procent": None,
            "payback_manader": None,
            "n_simulations": 0,
            "antaganden": ["Otillräcklig historisk placeringsdata"],
            "method": "bootstrap_95",
            "algorithm_version": ALGORITHM_VERSION,
        }

    rng = random.Random(rng_seed) if rng_seed is not None else random
    rates = list(historical_placements)
    total_kostnad = participants * training_cost_per_person

    nets: list[float] = []
    for _ in range(n_bootstrap):
        sampled_rate = rng.choice(rates)
        placed = participants * transition_score * sampled_rate
        sparad_akassa = placed * _AKASSA_MANADSBELOPP_KR * _AKASSA_SNITT_MANADER
        atervunnen_skatt = placed * _MEDIANLON_KR * _KOMMUNALSKATT_ANDEL * 12
        netto = sparad_akassa + atervunnen_skatt - total_kostnad
        nets.append(netto)

    medel_netto = mean(nets)
    ci_low = _percentile(nets, 2.5)
    ci_high = _percentile(nets, 97.5)
    roi_procent = (medel_netto / total_kostnad * 100) if total_kostnad > 0 else 0.0

    arlig_intakt = medel_netto + total_kostnad
    if arlig_intakt > 0:
        payback_manader = int(total_kostnad / (arlig_intakt / 12))
    else:
        payback_manader = None

    log.info(
        "roi.bootstrap",
        participants=participants,
        cost_per_person=training_cost_per_person,
        net_mean=round(medel_netto),
        ci_low=round(ci_low),
        ci_high=round(ci_high),
        n_sim=n_bootstrap,
    )

    return {
        "net_benefit_kr": round(medel_netto),
        "ci_95_low_kr": round(ci_low),
        "ci_95_high_kr": round(ci_high),
        "roi_procent": round(roi_procent, 1),
        "payback_manader": payback_manader,
        "n_simulations": n_bootstrap,
        "method": "bootstrap_95",
        "algorithm_version": ALGORITHM_VERSION,
        "antaganden": [
            f"A-kassa: {_AKASSA_MANADSBELOPP_KR:,} kr/mån × "
            f"{_AKASSA_SNITT_MANADER} mån (snitt arbetslöshetstid)",
            f"Medianlön Jönköpings län 2024: {_MEDIANLON_KR:,} kr/mån "
            "(källa: SCB AM0110)",
            f"Kommunalskatt Jönköpings län 2024 (snitt): "
            f"{_KOMMUNALSKATT_ANDEL * 100:.2f}%",
            "Placeringsgrad samplad från MYH årsrapporter 2018–2024 "
            f"(intervall: {min(rates) * 100:.0f}%–{max(rates) * 100:.0f}%)",
            f"Övergångsgrad använd: {transition_score * 100:.0f}%",
            f"Bootstrap-simuleringar: {n_bootstrap}",
        ],
    }
