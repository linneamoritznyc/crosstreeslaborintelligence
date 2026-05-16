"""Läser in transformerad data i Neo4j AuraDB."""
from neo4j import AsyncGraphDatabase
import os
import structlog

log = structlog.get_logger()

_driver = AsyncGraphDatabase.driver(
    os.environ.get("NEO4J_URI", ""),
    auth=(
        os.environ.get("NEO4J_USERNAME", "neo4j"),
        os.environ.get("NEO4J_PASSWORD", ""),
    ),
)


async def load_occupations(occupations: list[dict]) -> None:
    async with _driver.session() as db:
        await db.run(
            """
            UNWIND $rows AS row
            MERGE (o:Occupation {id: row.id})
            SET o.name = row.name,
                o.ssyk_code = row.ssyk_code,
                o.description = row.description
            """,
            rows=occupations,
        )
    log.info("neo4j.load.occupations", count=len(occupations))


async def load_skills(skills: list[dict]) -> None:
    async with _driver.session() as db:
        await db.run(
            """
            UNWIND $rows AS row
            MERGE (s:Skill {id: row.id})
            SET s.name = row.name, s.type = row.type
            """,
            rows=skills,
        )
    log.info("neo4j.load.skills", count=len(skills))


async def load_substitutability(scores: dict[tuple[str, str], float]) -> None:
    rows = [{"a": a, "b": b, "weight": w} for (a, b), w in scores.items()]
    async with _driver.session() as db:
        await db.run(
            """
            UNWIND $rows AS row
            MATCH (a:Occupation {id: row.a}), (b:Occupation {id: row.b})
            MERGE (a)-[r:SUBSTITUTABLE_BY]->(b)
            SET r.weight = row.weight
            """,
            rows=rows,
        )
    log.info("neo4j.load.substitutability", count=len(rows))


if __name__ == "__main__":
    import asyncio
    asyncio.run(load_occupations([]))
