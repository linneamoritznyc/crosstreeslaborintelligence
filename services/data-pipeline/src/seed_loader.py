"""Laddar seed-data i Neo4j för demo och lokal testmiljö.

Kör med:
    python -m src.seed_loader

Laddar seed/*.json direkt — kräver ingen nätverksåtkomst mot AF API:er.
Idempotent: MERGE säkerställer att upprepade körningar inte duplicerar data.
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

from ._shared.logging import get_logger, setup_pipeline_logging
from .load.neo4j_loader import close, load_occupations, load_skills, load_substitutability

log = get_logger(__name__)

_SEED_DIR = Path(__file__).parent.parent / "seed"


def _load(filename: str) -> list[dict]:
    path = _SEED_DIR / filename
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, list) else []


async def run_seed() -> None:
    occupations = _load("occupations_seed.json")
    skills = _load("skills_seed.json")
    substitutability = _load("substitutability_seed.json")

    log.info(
        "seed.start",
        occupations=len(occupations),
        skills=len(skills),
        substitutability_edges=len(substitutability),
    )

    await load_occupations(occupations)
    await load_skills(skills)
    await load_substitutability(substitutability)
    await close()

    log.info("seed.done")


if __name__ == "__main__":
    setup_pipeline_logging()
    asyncio.run(run_seed())
