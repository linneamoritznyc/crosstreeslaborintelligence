"""Extraherar AF-taxonomi: yrken, kompetenser och relationer.

Statiska SUN/SNI/SSYK-hierarkier hanteras av ``_datasets.py``. Data sparas
aldrig i Git — endast under en temporär katalog som rensas mellan
körningar. Allt loggas via structlog (EU AI Act Artikel 12).
"""
from __future__ import annotations

import asyncio
import os
import tempfile
from pathlib import Path
from typing import Any

import httpx

from .._shared.http import request_with_retry
from .._shared.logging import get_logger, setup_pipeline_logging
from ._datasets import download_all_static_datasets

log = get_logger(__name__)

TAXONOMY_BASE = os.environ.get(
    "AF_TAXONOMY_URL", "https://taxonomy.api.jobtechdev.se"
)
PAGE_SIZE = 1000


async def _fetch_paginated_concepts(
    client: httpx.AsyncClient, concept_type: str
) -> list[dict]:
    """Pagineras genom /v1/taxonomy/concepts?type=… tills alla sidor hämtats."""
    results: list[dict] = []
    offset = 0
    while True:
        params = {"type": concept_type, "offset": offset, "limit": PAGE_SIZE}
        response = await request_with_retry(
            client, "GET", f"{TAXONOMY_BASE}/v1/taxonomy/concepts", params=params
        )
        page: list[dict] = response.json()
        if not page:
            break
        results.extend(page)
        log.info(
            "taxonomy.page",
            type=concept_type,
            offset=offset,
            count=len(page),
            total_so_far=len(results),
        )
        if len(page) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return results


async def fetch_occupations(client: httpx.AsyncClient) -> list[dict]:
    return await _fetch_paginated_concepts(client, "occupation-name")


async def fetch_skills(client: httpx.AsyncClient) -> list[dict]:
    return await _fetch_paginated_concepts(client, "competency")


async def fetch_substitutability(client: httpx.AsyncClient) -> list[dict]:
    url = (
        f"{TAXONOMY_BASE}/v1/taxonomy/specific/relations/"
        "substitutability-relations-between-occupations"
    )
    response = await request_with_retry(client, "GET", url)
    data: list[dict] = response.json()
    log.info("taxonomy.substitutability.fetched", count=len(data))
    return data


async def fetch_occupation_skill_relations(client: httpx.AsyncClient) -> list[dict]:
    url = (
        f"{TAXONOMY_BASE}/v1/taxonomy/specific/relations/"
        "occupation-skill-relations"
    )
    response = await request_with_retry(client, "GET", url)
    data: list[dict] = response.json()
    log.info("taxonomy.occupation_skill_relations.fetched", count=len(data))
    return data


async def extract_all(temp_dir: Path) -> dict[str, Any]:
    """Hämtar alla källor parallellt och returnerar råa svar för transform-steget."""
    async with httpx.AsyncClient(timeout=120) as client:
        occupations, skills, subs, occ_skill = await asyncio.gather(
            fetch_occupations(client),
            fetch_skills(client),
            fetch_substitutability(client),
            fetch_occupation_skill_relations(client),
        )
        dataset_paths = await download_all_static_datasets(
            client, temp_dir / "datasets"
        )
    return {
        "occupations": occupations,
        "skills": skills,
        "substitutability": subs,
        "occupation_skill_relations": occ_skill,
        "static_dataset_paths": [str(p) for p in dataset_paths],
    }


if __name__ == "__main__":
    setup_pipeline_logging()
    tmp = Path(tempfile.mkdtemp(prefix="crosstrees_taxonomy_"))
    result = asyncio.run(extract_all(tmp))
    log.info(
        "taxonomy.extract.done",
        occupations=len(result["occupations"]),
        skills=len(result["skills"]),
        substitutability=len(result["substitutability"]),
        occupation_skill_relations=len(result["occupation_skill_relations"]),
        static_files=len(result["static_dataset_paths"]),
        temp_dir=str(tmp),
    )
