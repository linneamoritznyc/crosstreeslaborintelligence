"""Läser in vektorembeddings i Qdrant Cloud."""
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import os
import structlog

log = structlog.get_logger()

_client = AsyncQdrantClient(
    url=os.environ.get("QDRANT_URL", ""),
    api_key=os.environ.get("QDRANT_API_KEY", ""),
)

_COLLECTION = "occupations"
_VECTOR_SIZE = 1536


async def ensure_collection() -> None:
    collections = await _client.get_collections()
    names = [c.name for c in collections.collections]
    if _COLLECTION not in names:
        await _client.create_collection(
            _COLLECTION,
            vectors_config=VectorParams(size=_VECTOR_SIZE, distance=Distance.COSINE),
        )
        log.info("qdrant.collection.created", collection=_COLLECTION)


async def upsert_embeddings(points: list[dict]) -> None:
    await ensure_collection()
    structs = [
        PointStruct(id=p["id"], vector=p["vector"], payload=p.get("payload", {}))
        for p in points
    ]
    await _client.upsert(collection_name=_COLLECTION, points=structs)
    log.info("qdrant.upsert", count=len(structs))
