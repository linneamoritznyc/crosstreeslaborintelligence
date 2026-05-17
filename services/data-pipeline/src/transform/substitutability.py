"""Normaliserar substituerbarhetsrelationer till riktade Neo4j-kanter.

Skapar två kanter per AF-relation:
- ``can_become``: A→B (vad personen kan utvecklas till)
- ``can_replace``: B→A (vem som kan ersätta A i ett yrke)
"""
from __future__ import annotations

from typing import Literal

from .._shared.logging import get_logger

log = get_logger(__name__)

Direction = Literal["can_become", "can_replace"]

# AF rapporterar 1–3 i fältet substitutability_level. Vi mappar till
# 0–100-skalan som UI:t använder. Tre nivåer behålls — inget linjärt brus
# uppfinns där AF inte har data.
_LEVEL_TO_SCORE: dict[int, int] = {
    1: 25,  # låg
    2: 50,  # medel
    3: 75,  # hög
}


def _coerce_level(value: object) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float) and value.is_integer():
        return int(value)
    if isinstance(value, str) and value.strip().isdigit():
        return int(value.strip())
    return None


def transform_substitutability(relations: list[dict]) -> list[dict]:
    """Returnerar en lista riktade kanter klara att MERGE:as i Neo4j."""
    edges: list[dict] = []
    skipped = 0

    for rel in relations:
        source = rel.get("from_occupation_id")
        target = rel.get("to_occupation_id")
        level = _coerce_level(rel.get("substitutability_level"))

        if (
            not isinstance(source, str)
            or not isinstance(target, str)
            or source == target
            or level not in _LEVEL_TO_SCORE
        ):
            skipped += 1
            continue

        score = _LEVEL_TO_SCORE[level]
        edges.append(
            {
                "source_id": source,
                "target_id": target,
                "score": score,
                "direction": "can_become",
            }
        )
        edges.append(
            {
                "source_id": target,
                "target_id": source,
                "score": score,
                "direction": "can_replace",
            }
        )

    log.info(
        "substitutability.transformed",
        input=len(relations),
        edges=len(edges),
        skipped=skipped,
    )
    return edges
