"""Huvud-orkestratorn för data-pipeline: extract → transform → load → validate.

Körs av GitHub Actions (taxonomy-sync.yml) och kan köras manuellt:
    python -m src.pipeline

Alla steg loggas via structlog. Louvain-klustring hoppas över om Neo4j GDS
saknas (t.ex. AuraDB Free-tier) — övrig data laddas fortfarande.
"""
from __future__ import annotations

import asyncio
import tempfile
from pathlib import Path

from ._shared.logging import get_logger, setup_pipeline_logging
from .extract.taxonomy import extract_all
from .transform.occupations import transform_occupations, load_static_dataset
from .transform.skills import transform_skills
from .transform.substitutability import transform_substitutability
from .load.neo4j_loader import (
    close,
    deprecate_removed_occupations,
    load_occupation_skill_relations,
    load_occupations,
    load_skills,
    load_substitutability,
    run_louvain_clustering,
)

log = get_logger(__name__)


async def run_pipeline() -> None:
    tmp = Path(tempfile.mkdtemp(prefix="crosstrees_pipeline_"))
    log.info("pipeline.start", temp_dir=str(tmp))

    raw = await extract_all(tmp)
    log.info(
        "pipeline.extract.done",
        occupations=len(raw["occupations"]),
        skills=len(raw["skills"]),
        substitutability=len(raw["substitutability"]),
        occ_skill_relations=len(raw["occupation_skill_relations"]),
        static_files=len(raw["static_dataset_paths"]),
    )

    # Ladda SSYK-karta från nedladdad statisk fil om tillgänglig
    ssyk_path = tmp / "datasets" / "ssyk-level-4-groups-with-related-occupations.json"
    wh_path = tmp / "datasets" / "the-ssyk-hierarchy-with-occupations.json"
    ssyk_groups = load_static_dataset(ssyk_path) if ssyk_path.exists() else []
    wh_concepts = load_static_dataset(wh_path) if wh_path.exists() else []

    occupations = transform_occupations(raw["occupations"], ssyk_groups, wh_concepts)
    skills = transform_skills(raw["skills"])
    edges = transform_substitutability(raw["substitutability"])

    await load_occupations(occupations)
    await load_skills(skills)
    await load_substitutability(edges)
    await load_occupation_skill_relations(raw["occupation_skill_relations"])

    current_ids = {o["id"] for o in occupations}
    deprecated = await deprecate_removed_occupations(current_ids)
    log.info("pipeline.deprecate", deprecated=deprecated)

    try:
        communities = await run_louvain_clustering()
        log.info("pipeline.louvain", communities=communities)
    except Exception as exc:
        log.warning(
            "pipeline.louvain.skipped",
            reason=str(exc),
            note="Kräver Neo4j GDS (AuraDB Professional/Enterprise)",
        )

    await close()
    log.info("pipeline.done", occupations=len(occupations), skills=len(skills), edges=len(edges))


if __name__ == "__main__":
    setup_pipeline_logging()
    asyncio.run(run_pipeline())
