import math
from typing import Optional
from datetime import date

def wilson_score_interval(p: float, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return 0.0, 1.0
    center = (p + z**2 / (2*n)) / (1 + z**2/n)
    margin = z * math.sqrt(p*(1-p)/n + z**2/(4*n**2)) / (1 + z**2/n)
    return max(0.0, center - margin), min(1.0, center + margin)

def calculate_fit_score(
    user_skill_ids: set[str],
    job_skill_ids: dict[str, str],   # skill_id → "required"|"preferred"|"bonus"
    skill_idf: dict[str, float]      # Förberäknad från historiska annonser
) -> Optional[dict]:
    """
    Viktad TF-IDF intersection med Wilson score-konfidensintervall.
    Returnerar None om jobbdata saknas — aldrig 50 som default.
    """
    if not job_skill_ids:
        return None

    required = {k for k, v in job_skill_ids.items() if v == "required"}
    preferred = {k for k, v in job_skill_ids.items() if v == "preferred"}
    bonus = {k for k, v in job_skill_ids.items() if v == "bonus"}

    def weighted_overlap(skill_set: set, user_set: set) -> float:
        if not skill_set:
            return 1.0
        total = sum(skill_idf.get(s, 1.0) for s in skill_set)
        matched = sum(skill_idf.get(s, 1.0) for s in skill_set & user_set)
        return matched / total if total > 0 else 0.0

    score = (
        weighted_overlap(required, user_skill_ids) * 0.60 +
        weighted_overlap(preferred, user_skill_ids) * 0.30 +
        weighted_overlap(bonus, user_skill_ids) * 0.10
    ) * 100

    # Wilson score-konfidensintervall — inte godtycklig n>=3-gräns
    n_required = len(required)
    p_hat = len(user_skill_ids & required) / max(n_required, 1)
    ci_low, ci_high = wilson_score_interval(p_hat, n_required)

    return {
        "score": round(score, 1),
        "missing_required": list(required - user_skill_ids),
        "missing_preferred": list(preferred - user_skill_ids),
        "matched_required": list(user_skill_ids & required),
        "confidence_interval": {
            "low": round(ci_low * 100, 1),
            "high": round(ci_high * 100, 1),
            "method": "wilson_score_95"
        }
    }
