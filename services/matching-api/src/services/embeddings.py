"""Session-bunden kompetenslagring.

Redis används primärt. Faller tillbaka till in-memory dict om Redis saknas
— transient men räcker för demo-läge när containern lever.
"""
from __future__ import annotations

import json
import os

from .cache import EMBEDDING_TTL, redis_client

_memory_sessions: dict[str, list[str]] = {}


async def store_session_skills(session_id: str, skill_ids: list[str]) -> None:
    try:
        await redis_client.setex(
            f"session:{session_id}:skills",
            EMBEDDING_TTL,
            json.dumps(skill_ids),
        )
    except Exception:
        _memory_sessions[session_id] = skill_ids


async def get_session_skill_ids(session_id: str) -> list[str]:
    try:
        raw = await redis_client.get(f"session:{session_id}:skills")
        if raw is not None:
            return json.loads(raw)
    except Exception:
        pass
    return _memory_sessions.get(session_id, [])


def qdrant_configured() -> bool:
    return bool(os.environ.get("QDRANT_URL")) and bool(os.environ.get("QDRANT_API_KEY"))
