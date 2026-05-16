"""Benchmarkar likhetsmåttens precision mot manuellt annoterade par."""
from dataclasses import dataclass
from typing import Callable


@dataclass
class AnnotatedPair:
    occupation_a: str
    occupation_b: str
    human_score: float


def precision_at_k(
    annotated: list[AnnotatedPair],
    score_fn: Callable[[str, str], float],
    k: int = 10,
    threshold: float = 0.5,
) -> float:
    ranked = sorted(annotated, key=lambda p: score_fn(p.occupation_a, p.occupation_b), reverse=True)
    top_k = ranked[:k]
    hits = sum(1 for p in top_k if p.human_score >= threshold)
    return hits / k if k > 0 else 0.0
