import os
from datetime import datetime, timezone
from typing import Literal

import pybreaker
from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from ..middleware.logging import get_logger
from ..services.cache import redis_client

log = get_logger(__name__)
router = APIRouter()

OverallStatus = Literal["ok", "degraded", "ej_konfigurerad"]
ComponentStatus = Literal["ok", "degraded", "ej_ansluten", "ej_konfigurerad", "okand"]
BreakerStatus = Literal["closed", "half_open", "open", "okand"]

# Algoritmparametrar — motiveringar enligt NEW_REPO_SPEC.md sektion 3.
# semantic_threshold valideras i src/evaluate/similarity_benchmark.py.
SEMANTIC_THRESHOLD = 0.65
PAGERANK_DAMPING = 0.85
THRESHOLD_BASIS = (
    "semantic_threshold=0.65 vald för Jaccard-likhet på AF-taxonomi och "
    "valideras kvartalsvis i similarity_benchmark.py. "
    "pagerank_damping=0.85 är standardvärdet från Brin & Page (1998). "
    "Matchningspoäng använder Wilson 95% konfidensintervall — aldrig "
    "fabricerade default-värden."
)

# Pybreaker — öppnar efter 5 fel inom 60 sekunder mot Arbetsförmedlingens API.
_AF_BREAKER = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=60)


class DataQuality(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    occupations_count: int | None
    skills_count: int | None
    graph_edges_count: int | None
    note: str | None = None


class AlgorithmParams(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    semantic_threshold: float = Field(..., ge=0.0, le=1.0)
    pagerank_damping: float = Field(..., ge=0.0, le=1.0)
    threshold_basis: str = Field(..., min_length=1)


class ExternalApis(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    af_jobsearch: ComponentStatus
    af_enrichments: ComponentStatus
    anthropic: ComponentStatus
    circuit_breaker_af: BreakerStatus


class Databases(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    neo4j: ComponentStatus
    redis: ComponentStatus
    qdrant: ComponentStatus


class DataFreshness(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    taxonomy_last_synced_at: str | None
    jobs_last_synced_at: str | None
    trends_last_synced_at: str | None


class HealthResponse(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    status: OverallStatus
    version: str
    data_freshness: DataFreshness
    data_quality: DataQuality
    algorithm_params: AlgorithmParams
    external_apis: ExternalApis
    databases: Databases
    checked_at: datetime


def _config_status(*env_keys: str) -> ComponentStatus:
    """Returnerar 'ej_konfigurerad' om någon nyckel saknas, annars 'okand'."""
    for key in env_keys:
        if not os.environ.get(key):
            return "ej_konfigurerad"
    return "okand"


def _breaker_state(breaker: pybreaker.CircuitBreaker) -> BreakerStatus:
    state = getattr(breaker, "current_state", None)
    if state in ("closed", "half_open", "open"):
        return state  # type: ignore[return-value]
    return "okand"


async def _check_redis() -> ComponentStatus:
    if not os.environ.get("REDIS_URL"):
        return "ej_konfigurerad"
    try:
        pong = await redis_client.ping()
    except Exception as exc:
        log.warning("health.redis.fel", fel=str(exc))
        return "degraded"
    return "ok" if pong else "degraded"


async def _read_freshness(key: str) -> str | None:
    """Läser tidsstämpel som data-pipeline publicerar i Redis efter varje körning."""
    if not os.environ.get("REDIS_URL"):
        return None
    try:
        value = await redis_client.get(key)
    except Exception:
        return None
    if value is None:
        return None
    return value.decode() if isinstance(value, bytes) else str(value)


def _overall(components: list[ComponentStatus]) -> OverallStatus:
    if any(c == "degraded" for c in components):
        return "degraded"
    if any(c == "ej_konfigurerad" for c in components):
        return "ej_konfigurerad"
    return "ok"


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Granska driftstatus utan att anropa Neo4j eller Qdrant.

    Datakvalitetsräknare publiceras av data-pipeline i Redis efter varje
    körning — denna router läser dem men anropar aldrig grafdatabasen.
    """
    version = os.environ.get("ALGORITHM_VERSION", "okand")

    redis_status = await _check_redis()
    neo4j_status = _config_status("NEO4J_URI", "NEO4J_PASSWORD")
    qdrant_status = _config_status("QDRANT_URL", "QDRANT_API_KEY")
    af_jobsearch_status = _config_status("AF_JOBSEARCH_URL")
    af_enrichments_status = _config_status("AF_ENRICHMENTS_URL")
    anthropic_status = _config_status("ANTHROPIC_API_KEY")

    freshness = DataFreshness(
        taxonomy_last_synced_at=await _read_freshness("freshness:taxonomy"),
        jobs_last_synced_at=await _read_freshness("freshness:jobs"),
        trends_last_synced_at=await _read_freshness("freshness:trends"),
    )

    # Räknare publiceras av services/data-pipeline efter varje synk.
    # Innan första körning, eller om Neo4j ännu inte är ansluten, returneras None.
    data_quality = DataQuality(
        occupations_count=None,
        skills_count=None,
        graph_edges_count=None,
        note="Räknare publiceras av data-pipeline efter taxonomy-sync.",
    )

    overall = _overall(
        [
            redis_status, neo4j_status, qdrant_status,
            af_jobsearch_status, af_enrichments_status, anthropic_status,
        ]
    )

    response = HealthResponse(
        status=overall,
        version=version,
        data_freshness=freshness,
        data_quality=data_quality,
        algorithm_params=AlgorithmParams(
            semantic_threshold=SEMANTIC_THRESHOLD,
            pagerank_damping=PAGERANK_DAMPING,
            threshold_basis=THRESHOLD_BASIS,
        ),
        external_apis=ExternalApis(
            af_jobsearch=af_jobsearch_status,
            af_enrichments=af_enrichments_status,
            anthropic=anthropic_status,
            circuit_breaker_af=_breaker_state(_AF_BREAKER),
        ),
        databases=Databases(
            neo4j=neo4j_status,
            redis=redis_status,
            qdrant=qdrant_status,
        ),
        checked_at=datetime.now(timezone.utc),
    )

    log.info("health.checked", status=overall, version=version)
    return response
