from neo4j import AsyncGraphDatabase
import os
from .cache import redis_client, OCCUPATION_OVERVIEW_TTL
import json

_driver = AsyncGraphDatabase.driver(
    os.environ.get("NEO4J_URI", ""),
    auth=(
        os.environ.get("NEO4J_USERNAME", "neo4j"),
        os.environ.get("NEO4J_PASSWORD", ""),
    ),
)


async def get_career_graph(session_id: str) -> dict:
    cache_key = f"graph:career:{session_id}"
    cached = await redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    async with _driver.session() as db:
        result = await db.run(
            """
            MATCH (o:Occupation)-[r:SUBSTITUTABLE_BY|ADJACENT_TO]->(target:Occupation)
            RETURN o.id AS from_id, o.name AS from_name,
                   target.id AS to_id, target.name AS to_name,
                   type(r) AS rel_type, r.weight AS weight
            LIMIT 50
            """
        )
        records = await result.data()

    nodes: dict[str, dict] = {}
    edges = []
    for rec in records:
        nodes[rec["from_id"]] = {"id": rec["from_id"], "label": rec["from_name"], "type": "current"}
        nodes[rec["to_id"]] = {"id": rec["to_id"], "label": rec["to_name"], "type": "adjacent"}
        edges.append({"from": rec["from_id"], "to": rec["to_id"], "weight": rec["weight"] or 1.0})

    graph = {"nodes": list(nodes.values()), "edges": edges}
    await redis_client.setex(cache_key, OCCUPATION_OVERVIEW_TTL, json.dumps(graph))
    return graph


async def get_gaps(session_id: str, target_occupation_id: str) -> dict:
    async with _driver.session() as db:
        result = await db.run(
            """
            MATCH (o:Occupation {id: $target})-[:REQUIRES]->(s:Skill)
            RETURN s.id AS skill_id, s.name AS skill_name, s.priority AS priority
            ORDER BY s.priority ASC
            """,
            target=target_occupation_id,
        )
        gaps = await result.data()
        target_res = await db.run(
            "MATCH (o:Occupation {id: $id}) RETURN o.name AS namn",
            id=target_occupation_id,
        )
        target_data = await target_res.single()

    return {
        "target_occupation": target_data["namn"] if target_data else target_occupation_id,
        "gaps": gaps,
        "education_suggestions": [],
    }
