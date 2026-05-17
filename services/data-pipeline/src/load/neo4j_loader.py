"""Idempotent loader för Neo4j AuraDB.

Använder endast MERGE — aldrig CREATE. Varje skrivning sätter updated_at.
Schemat (constraints och index) hanteras av infra/neo4j/schema.cypher.
"""
from __future__ import annotations

import os
from typing import Iterable

from neo4j import AsyncGraphDatabase

from .._shared.logging import get_logger

log = get_logger(__name__)

_driver = AsyncGraphDatabase.driver(
    os.environ.get("NEO4J_URI", "bolt://localhost:7687"),
    auth=(
        os.environ.get("NEO4J_USERNAME", "neo4j"),
        os.environ.get("NEO4J_PASSWORD", ""),
    ),
)

_CHUNK_SIZE = 500
_GDS_GRAPH_NAME = "occupation_substitutability"


def _chunks(items: list[dict], size: int = _CHUNK_SIZE) -> Iterable[list[dict]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


async def load_occupations(occupations: list[dict]) -> int:
    """MERGE varje yrke på id. Rensar deprecated-flagga eftersom posten finns kvar."""
    written = 0
    async with _driver.session() as db:
        for batch in _chunks(occupations):
            await db.run(
                """
                UNWIND $rows AS row
                MERGE (o:Occupation {id: row.id})
                SET o.name = row.name,
                    o.ssyk_code = row.ssyk_code,
                    o.definition = row.definition,
                    o.workplace_model = row.workplace_model,
                    o.updated_at = datetime(),
                    o.deprecated = NULL
                """,
                rows=batch,
            )
            written += len(batch)
    log.info("neo4j.load_occupations", count=written)
    return written


async def load_skills(skills: list[dict]) -> int:
    written = 0
    async with _driver.session() as db:
        for batch in _chunks(skills):
            await db.run(
                """
                UNWIND $rows AS row
                MERGE (s:Skill {id: row.id})
                SET s.name = row.name,
                    s.alt_labels = row.alt_labels,
                    s.esco_uri = row.esco_uri,
                    s.updated_at = datetime()
                """,
                rows=batch,
            )
            written += len(batch)
    log.info("neo4j.load_skills", count=written)
    return written


async def load_substitutability(edges: list[dict]) -> int:
    """MERGE på (source, target, direction) — riktningen ingår i nyckeln."""
    written = 0
    async with _driver.session() as db:
        for batch in _chunks(edges):
            await db.run(
                """
                UNWIND $rows AS row
                MATCH (a:Occupation {id: row.source_id})
                MATCH (b:Occupation {id: row.target_id})
                MERGE (a)-[r:SUBSTITUTABLE_BY {direction: row.direction}]->(b)
                SET r.score = row.score,
                    r.updated_at = datetime()
                """,
                rows=batch,
            )
            written += len(batch)
    log.info("neo4j.load_substitutability", count=written)
    return written


async def load_occupation_skill_relations(relations: list[dict]) -> int:
    """MERGE på (occupation_concept_id, skill_concept_id)."""
    written = 0
    async with _driver.session() as db:
        for batch in _chunks(relations):
            await db.run(
                """
                UNWIND $rows AS row
                MATCH (o:Occupation {id: row.occupation_concept_id})
                MATCH (s:Skill {id: row.skill_concept_id})
                MERGE (o)-[r:REQUIRES]->(s)
                SET r.importance = row.importance,
                    r.updated_at = datetime()
                """,
                rows=batch,
            )
            written += len(batch)
    log.info("neo4j.load_occupation_skill_relations", count=written)
    return written


async def deprecate_removed_occupations(current_ids: set[str]) -> int:
    """Markerar yrken som inte längre finns i AF-taxonomin som föråldrade."""
    async with _driver.session() as db:
        result = await db.run(
            """
            MATCH (o:Occupation)
            WHERE NOT o.id IN $ids AND o.deprecated IS NULL
            SET o.deprecated = datetime(),
                o.updated_at = datetime()
            RETURN count(o) AS n
            """,
            ids=list(current_ids),
        )
        record = await result.single()
    deprecated = int(record["n"]) if record else 0
    log.info("neo4j.deprecated", count=deprecated)
    return deprecated


async def run_louvain_clustering() -> int:
    """Beräknar Louvain-communities över substitutability-grafen.

    Resultatet (``community_id``) skrivs på varje Occupation-nod via
    Neo4j GDS. Den tillfälliga in-memory-grafen rensas både före och efter.
    """
    async with _driver.session() as db:
        await db.run(
            "CALL gds.graph.drop($name, false) YIELD graphName RETURN graphName",
            name=_GDS_GRAPH_NAME,
        )
        await db.run(
            """
            CALL gds.graph.project(
                $name,
                'Occupation',
                { SUBSTITUTABLE_BY: { properties: 'score' } }
            )
            """,
            name=_GDS_GRAPH_NAME,
        )
        result = await db.run(
            """
            CALL gds.louvain.write(
                $name,
                {
                    writeProperty: 'community_id',
                    relationshipWeightProperty: 'score'
                }
            )
            YIELD communityCount
            RETURN communityCount AS n
            """,
            name=_GDS_GRAPH_NAME,
        )
        record = await result.single()
        await db.run(
            "CALL gds.graph.drop($name, false) YIELD graphName RETURN graphName",
            name=_GDS_GRAPH_NAME,
        )
    communities = int(record["n"]) if record else 0
    log.info("neo4j.louvain", communities=communities)
    return communities


async def close() -> None:
    await _driver.close()
