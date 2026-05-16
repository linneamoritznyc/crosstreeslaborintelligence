from pydantic import BaseModel


class ConfidenceInterval(BaseModel):
    low: float
    high: float
    method: str


class MatchResult(BaseModel):
    score: float
    missing_required: list[str]
    missing_preferred: list[str]
    matched_required: list[str]
    confidence_interval: ConfidenceInterval
