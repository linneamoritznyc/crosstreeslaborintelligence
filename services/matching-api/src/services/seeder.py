"""Idempotent Neo4j seed — körs vid startup om databasen är tom."""
from __future__ import annotations

import json
import os
from pathlib import Path

from neo4j import AsyncGraphDatabase

from ..middleware.logging import get_logger

log = get_logger(__name__)

_SEED_DIR = Path(__file__).parent.parent.parent / "seed"

_CHUNK = 500


def _load(filename: str) -> list[dict]:
    path = _SEED_DIR / filename
    if not path.exists():
        log.warning("seeder.missing_file", file=str(path))
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, list) else []


def _chunks(items: list, size: int = _CHUNK):
    for i in range(0, len(items), size):
        yield items[i : i + size]


async def seed_if_empty() -> None:
    uri = os.environ.get("NEO4J_URI", "")
    if not uri:
        log.info("seeder.skip", reason="NEO4J_URI saknas")
        return

    driver = AsyncGraphDatabase.driver(
        uri,
        auth=(
            os.environ.get("NEO4J_USERNAME", "neo4j"),
            os.environ.get("NEO4J_PASSWORD", ""),
        ),
    )
    try:
        async with driver.session() as db:
            r = await db.run("MATCH (o:Occupation) RETURN count(o) AS n")
            count = (await r.single())["n"]

        if count > 0:
            log.info("seeder.skip", reason="data finns redan", occupations=count)
            return

        log.info("seeder.start", reason="tom databas — laddar seed")
        occupations = _load("occupations_seed.json")
        skills = _load("skills_seed.json")
        substitutability = _load("substitutability_seed.json")

        async with driver.session() as db:
            for batch in _chunks(occupations):
                await db.run(
                    """
                    UNWIND $rows AS row
                    MERGE (o:Occupation {id: row.id})
                    SET o.name = row.name, o.ssyk_code = row.ssyk_code,
                        o.definition = row.definition,
                        o.workplace_model = row.workplace_model,
                        o.updated_at = datetime(), o.deprecated = NULL
                    """,
                    rows=batch,
                )

            for batch in _chunks(skills):
                await db.run(
                    """
                    UNWIND $rows AS row
                    MERGE (s:Skill {id: row.id})
                    SET s.name = row.name, s.alt_labels = row.alt_labels,
                        s.esco_uri = row.esco_uri, s.updated_at = datetime()
                    """,
                    rows=batch,
                )

            for batch in _chunks(substitutability):
                await db.run(
                    """
                    UNWIND $rows AS row
                    MATCH (a:Occupation {id: row.source_id})
                    MATCH (b:Occupation {id: row.target_id})
                    MERGE (a)-[r:SUBSTITUTABLE_BY {direction: row.direction}]->(b)
                    SET r.score = row.score, r.updated_at = datetime()
                    """,
                    rows=batch,
                )

        log.info(
            "seeder.done",
            occupations=len(occupations),
            skills=len(skills),
            edges=len(substitutability),
        )
    except Exception as exc:
        log.warning("seeder.error", error=str(exc)[:200])
    finally:
        try:
            await driver.close()
        except Exception:
            pass
