"""Smoke-test mot Neo4j: räknar noder och listar prov från grafen.

Kör med:
    python -m src.smoke_test

Använder samma NEO4J_*-miljövariabler som loaders. Output går till stdout
som strukturerad JSON via structlog plus ett människo-läsbart sammandrag.
"""
from __future__ import annotations

import asyncio
import os
import sys

from neo4j import AsyncGraphDatabase

from ._shared.logging import get_logger, setup_pipeline_logging

log = get_logger(__name__)


async def run_smoke_test() -> int:
    """Returnerar 0 om grafen har data, 1 om den är tom eller anslutning failar."""
    driver = AsyncGraphDatabase.driver(
        os.environ.get("NEO4J_URI", "bolt://localhost:7687"),
        auth=(
            os.environ.get("NEO4J_USERNAME", "neo4j"),
            os.environ.get("NEO4J_PASSWORD", ""),
        ),
    )

    try:
        async with driver.session() as db:
            counts = await (
                await db.run(
                    """
                    MATCH (o:Occupation) WITH count(o) AS occ
                    MATCH (s:Skill) WITH occ, count(s) AS skl
                    MATCH ()-[r:SUBSTITUTABLE_BY]->() WITH occ, skl, count(r) AS sub
                    RETURN occ, skl, sub
                    """
                )
            ).single()

            occ_sample = await (
                await db.run(
                    """
                    MATCH (o:Occupation)
                    RETURN o.id AS id, o.name AS name, o.ssyk_code AS ssyk
                    ORDER BY o.name LIMIT 5
                    """
                )
            ).data()

            edge_sample = await (
                await db.run(
                    """
                    MATCH (a:Occupation)-[r:SUBSTITUTABLE_BY]->(b:Occupation)
                    RETURN a.name AS fran, b.name AS till,
                           r.score AS score, r.direction AS direction
                    ORDER BY r.score DESC LIMIT 5
                    """
                )
            ).data()
    except Exception as exc:
        log.error("smoke.connection_failed", fel=str(exc))
        await driver.close()
        return 1

    await driver.close()

    n_occ = int(counts["occ"]) if counts else 0
    n_skl = int(counts["skl"]) if counts else 0
    n_sub = int(counts["sub"]) if counts else 0

    log.info("smoke.counts", occupations=n_occ, skills=n_skl, substitutability=n_sub)

    print("\n=== Crosstrees Neo4j smoke test ===", file=sys.stderr)
    print(f"Occupation-noder:      {n_occ}", file=sys.stderr)
    print(f"Skill-noder:           {n_skl}", file=sys.stderr)
    print(f"SUBSTITUTABLE_BY-kanter: {n_sub}", file=sys.stderr)

    print("\nFörsta 5 yrken (alfabetiskt):", file=sys.stderr)
    for row in occ_sample or []:
        print(f"  - {row['name']} (SSYK {row['ssyk']}) — id={row['id']}", file=sys.stderr)

    print("\nTopp 5 substituerbarhetskanter:", file=sys.stderr)
    for row in edge_sample or []:
        print(
            f"  - {row['fran']} → {row['till']}  "
            f"(score={row['score']}, riktning={row['direction']})",
            file=sys.stderr,
        )

    if n_occ == 0:
        print("\nFEL: grafen är tom. Kör 'python -m src.seed_loader' först.", file=sys.stderr)
        return 1
    print("\nOK: grafen innehåller data.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    setup_pipeline_logging()
    sys.exit(asyncio.run(run_smoke_test()))
