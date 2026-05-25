"""Redis-klient och namngivna TTL-konstanter — speglar matching-api/services/cache.py.

Motivering för TTL-värden: docs/NEW_REPO_SPEC.md sektion 3.3.
Magiska siffror är förbjudna enligt OPTIMIZED_CODEBASE_GUIDELINES.md.
"""
from __future__ import annotations

import json
import os
from typing import Any

import redis.asyncio as aioredis

JOB_SEARCH_SERVE_TTL = 900       # 15 min — Platsbanken realtidsuppdateringar
OCCUPATION_OVERVIEW_TTL = 14_400  # 4 h
TAXONOMY_TTL = 604_800           # 7 dagar — pipeline-styrt schema
FRESHNESS_TTL = 604_800          # 7 dagar — överlever en missad körning

_redis_url = os.environ.get("REDIS_URL")
if not _redis_url:
    raise RuntimeError("REDIS_URL saknas — sätt miljövariabeln innan pipeline körs")

redis_client = aioredis.from_url(_redis_url, decode_responses=False)


async def cache_json(key: str, value: Any, ttl_seconds: int) -> None:
    payload = json.dumps(value, ensure_ascii=False).encode("utf-8")
    await redis_client.setex(key, ttl_seconds, payload)


async def get_cached_json(key: str) -> Any | None:
    raw = await redis_client.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def set_freshness(source: str, iso_timestamp: str) -> None:
    """Pipeline publicerar tidsstämpeln; health-endpointen läser den."""
    await redis_client.setex(
        f"freshness:{source}", FRESHNESS_TTL, iso_timestamp.encode("utf-8")
    )
