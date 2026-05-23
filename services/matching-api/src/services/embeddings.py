"""Session-bunden kompetenslagring.

Redis används för session-baserad skill-lagring (1h TTL per CV).
Tolerant mot saknad Redis — UI får tom lista och degraderar gracefully.
"""
from __future__ import annotations

import json
import os

from .cache import EMBEDDING_TTL, redis_client


async def store_session_skills(session_id: str, skill_ids: list[str]) -> None:
    try:
        await redis_client.setex(
            f"session:{session_id}:skills",
            EMBEDDING_TTL,
            json.dumps(skill_ids),
        )
    except Exception:
        pass


async def get_session_skill_ids(session_id: str) -> list[str]:
    try:
        raw = await redis_client.get(f"session:{session_id}:skills")
    except Exception:
        return []
    if raw is None:
        return []
    return json.loads(raw)


def qdrant_configured() -> bool:
    return bool(os.environ.get("QDRANT_URL")) and bool(os.environ.get("QDRANT_API_KEY"))
