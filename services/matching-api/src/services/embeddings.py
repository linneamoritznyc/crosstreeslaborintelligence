from qdrant_client import AsyncQdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import os
from .cache import redis_client, EMBEDDING_TTL
import json

_qdrant = AsyncQdrantClient(
    url=os.environ.get("QDRANT_URL", ""),
    api_key=os.environ.get("QDRANT_API_KEY", ""),
)
_COLLECTION = "cv_skills"


async def store_session_skills(session_id: str, skill_ids: list[str]) -> None:
    await redis_client.setex(
        f"session:{session_id}:skills",
        EMBEDDING_TTL,
        json.dumps(skill_ids),
    )


async def get_session_skill_ids(session_id: str) -> list[str]:
    raw = await redis_client.get(f"session:{session_id}:skills")
    if raw is None:
        return []
    return json.loads(raw)
