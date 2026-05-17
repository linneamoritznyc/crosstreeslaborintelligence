import json
import asyncio
from typing import Any, Callable
import redis.asyncio as aioredis
import os

# TTL-konstanter — aldrig godtyckliga siffror
# Motivering: se NEW_REPO_SPEC.md sektion 3.3
JOB_SEARCH_SERVE_TTL = 900         # 15 min — Platsbanken realtidsuppdateringar
JOB_SEARCH_REVALIDATE_AFTER = 60   # 1 min — bakgrundsuppdatering startar
OCCUPATION_OVERVIEW_TTL = 14_400   # 4 h — långsammare förändringstakt
TAXONOMY_TTL = 604_800             # 7 dagar — styrs av pipeline-schema
EMBEDDING_TTL = 604_800            # 7 dagar — statiska mellan pipeline-körningar
CV_PARSE_TTL = 3_600               # 1 h — temporär sessionsdata
AI_ACT_LOG_RETENTION = 15_552_000  # 6 månader — Artikel 12 AI Act

redis_client = aioredis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379"))

async def get_with_swr(
    key: str,
    fetch_fn: Callable,
    serve_ttl: int,
    revalidate_after: int
) -> Any:
    """Stale-while-revalidate caching."""
    cached = await redis_client.get(key)
    ttl = await redis_client.ttl(key)
    age = serve_ttl - ttl

    if cached:
        if age < revalidate_after:
            return json.loads(cached)
        asyncio.create_task(_revalidate(key, fetch_fn, serve_ttl))
        return json.loads(cached)

    data = await fetch_fn()
    await redis_client.setex(key, serve_ttl, json.dumps(data))
    return data

async def _revalidate(key: str, fetch_fn: Callable, ttl: int) -> None:
    try:
        data = await fetch_fn()
        await redis_client.setex(key, ttl, json.dumps(data))
    except Exception:
        pass  # Stale data continues to serve
