"""Neo4j-frågor för karriärgrafen och kompetensglapp.

Använder SUBSTITUTABLE_BY-relationer (laddade av data-pipeline) för att
hitta möjliga karriärövergångar. Cachar resultat i Redis.
"""
from __future__ import annotations

import json
import os

from neo4j import AsyncGraphDatabase

from ..middleware.logging import get_logger
from .cache import redis_client, OCCUPATION_OVERVIEW_TTL

log = get_logger(__name__)

_driver = AsyncGraphDatabase.driver(
    os.environ.get("NEO4J_URI", ""),
    auth=(
        os.environ.get("NEO4J_USERNAME", "neo4j"),
        os.environ.get("NEO4J_PASSWORD", ""),
    ),
)


async def get_career_graph(session_id: str) -> dict:
    """Returnerar noder och kanter för kariärovergångsgraf, cachad per session."""
    cache_key = f"graph:career:{session_id}"
    if redis_client is not None:
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

    async with _driver.session() as db:
        result = await db.run(
            """
            MATCH (o:Occupation)-[r:SUBSTITUTABLE_BY]->(target:Occupation)
            RETURN o.id AS from_id, o.name AS from_name,
                   target.id AS to_id, target.name AS to_name,
                   r.score AS score, r.direction AS direction
            LIMIT 50
            """
        )
        records = await result.data()

    nodes: dict[str, dict] = {}
    edges = []
    for rec in records:
        nodes[rec["from_id"]] = {
            "id": rec["from_id"],
            "label": rec["from_name"],
            "type": "current",
        }
        nodes[rec["to_id"]] = {
            "id": rec["to_id"],
            "label": rec["to_name"],
            "type": "adjacent",
        }
        edges.append(
            {
                "from": rec["from_id"],
                "to": rec["to_id"],
                "score": rec["score"],
                "direction": rec["direction"],
            }
        )

    graph = {"nodes": list(nodes.values()), "edges": edges}
    if redis_client is not None:
        try:
            await redis_client.setex(cache_key, OCCUPATION_OVERVIEW_TTL, json.dumps(graph))
        except Exception:
            pass
    log.info(
        "graph.career", session_id=session_id, nodes=len(nodes), edges=len(edges)
    )
    return graph


async def get_gaps(session_id: str, target_occupation_id: str) -> dict:
    """Returnerar kompetensglapp mot ett målyrke, utan fabricerade förslag."""
    async with _driver.session() as db:
        skill_result = await db.run(
            """
            MATCH (o:Occupation {id: $target})-[r:REQUIRES]->(s:Skill)
            RETURN s.id AS skill_id, s.name AS skill_name,
                   r.importance AS importance
            ORDER BY r.importance DESC
            """,
            target=target_occupation_id,
        )
        gaps = await skill_result.data()

        occ_result = await db.run(
            "MATCH (o:Occupation {id: $id}) RETURN o.name AS namn",
            id=target_occupation_id,
        )
        occ_row = await occ_result.single()

    target_name = occ_row["namn"] if occ_row else target_occupation_id
    log.info(
        "graph.gaps", session_id=session_id, target=target_occupation_id, gaps=len(gaps)
    )
    return {
        "target_occupation": target_name,
        "gaps": gaps,
        "education_suggestions": [],
    }
