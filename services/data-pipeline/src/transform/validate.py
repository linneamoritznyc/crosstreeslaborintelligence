"""Validerar datakvalitet efter pipeline-körning."""
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


async def validate_graph() -> dict:
    async with _driver.session() as db:
        occ_res = await db.run("MATCH (o:Occupation) RETURN count(o) AS n")
        occ_count = (await occ_res.single())["n"]

        skill_res = await db.run("MATCH (s:Skill) RETURN count(s) AS n")
        skill_count = (await skill_res.single())["n"]

        rel_res = await db.run("MATCH ()-[r:SUBSTITUTABLE_BY]->() RETURN count(r) AS n")
        rel_count = (await rel_res.single())["n"]

    log.info("pipeline.validate", occupations=occ_count, skills=skill_count, relations=rel_count)
    return {"occupations": occ_count, "skills": skill_count, "substitutability_relations": rel_count}


if __name__ == "__main__":
    import asyncio
    asyncio.run(validate_graph())
