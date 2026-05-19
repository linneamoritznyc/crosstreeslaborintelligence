import json
import asyncio
import logging
from typing import Any, Callable
import redis.asyncio as aioredis
import os

log = logging.getLogger(__name__)

# TTL-konstanter — aldrig godtyckliga siffror
# Motivering: se NEW_REPO_SPEC.md sektion 3.3
JOB_SEARCH_SERVE_TTL = 900         # 15 min — Platsbanken realtidsuppdateringar
JOB_SEARCH_REVALIDATE_AFTER = 60   # 1 min — bakgrundsuppdatering startar
OCCUPATION_OVERVIEW_TTL = 14_400   # 4 h — långsammare förändringstakt
TAXONOMY_TTL = 604_800             # 7 dagar — styrs av pipeline-schema
EMBEDDING_TTL = 604_800            # 7 dagar — statiska mellan pipeline-körningar
CV_PARSE_TTL = 3_600               # 1 h — temporär sessionsdata
AI_ACT_LOG_RETENTION = 15_552_000  # 6 månader — Artikel 12 AI Act

_REDIS_URL = os.environ.get("REDIS_URL", "")
redis_client = aioredis.from_url(_REDIS_URL) if _REDIS_URL else None


async def get_with_swr(
    key: str,
    fetch_fn: Callable,
    serve_ttl: int,
    revalidate_after: int
) -> Any:
    """Stale-while-revalidate caching. Falls through to direct fetch if Redis unavailable."""
    if redis_client is None:
        return await fetch_fn()

    try:
        cached = await redis_client.get(key)
        if cached:
            ttl = await redis_client.ttl(key)
            age = serve_ttl - ttl
            if age < revalidate_after:
                return json.loads(cached)
            asyncio.create_task(_revalidate(key, fetch_fn, serve_ttl))
            return json.loads(cached)

        data = await fetch_fn()
        await redis_client.setex(key, serve_ttl, json.dumps(data))
        return data
    except Exception as exc:
        log.warning("cache.miss redis_unavailable key=%s err=%s", key, exc)
        return await fetch_fn()


async def _revalidate(key: str, fetch_fn: Callable, ttl: int) -> None:
    if redis_client is None:
        return
    try:
        data = await fetch_fn()
        await redis_client.setex(key, ttl, json.dumps(data))
    except Exception:
        pass  # Stale data continues to serve
