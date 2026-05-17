from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Endast Wilson-score 95% stöds — krav från OPTIMIZED_CODEBASE_GUIDELINES.md
# (konfidensintervall för alla matchningspoäng).
ConfidenceMethod = Literal["wilson_score_95"]


class ConfidenceInterval(BaseModel):
    """Konfidensintervall för matchningspoäng (0–100)."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    low: float = Field(..., ge=0.0, le=100.0)
    high: float = Field(..., ge=0.0, le=100.0)
    method: ConfidenceMethod = "wilson_score_95"


class MatchResult(BaseModel):
    """Resultat från viktad TF-IDF + Wilson-CI.

    Konstruktören ska aldrig anropas med fabricerade default-värden — om
    jobbdata saknas returnerar fit_score.calculate_fit_score() None i
    stället.
    """

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    score: float = Field(..., ge=0.0, le=100.0)
    missing_required: list[str]
    missing_preferred: list[str]
    matched_required: list[str]
    confidence_interval: ConfidenceInterval


class MatchExplanation(BaseModel):
    """Förklaring av matchningen — krav från EU AI Act Artikel 13."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    job_id: str = Field(..., min_length=1)
    weight_required: float = Field(default=0.60, ge=0.0, le=1.0)
    weight_preferred: float = Field(default=0.30, ge=0.0, le=1.0)
    weight_bonus: float = Field(default=0.10, ge=0.0, le=1.0)
    algorithm_version: str = Field(..., min_length=1)
    motivering: str = Field(
        ...,
        min_length=1,
        description="Mänskligt läsbar förklaring på svenska av varför poängen blev som den blev",
    )
