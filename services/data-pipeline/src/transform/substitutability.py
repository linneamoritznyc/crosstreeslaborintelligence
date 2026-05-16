"""Beräknar substituerbarhet mellan yrken med PageRank-vägd likhetsanalys."""
import numpy as np
from scipy.sparse import csr_matrix


def build_substitutability_matrix(
    occupation_skills: dict[str, set[str]]
) -> dict[tuple[str, str], float]:
    occupation_ids = list(occupation_skills.keys())
    n = len(occupation_ids)
    idx = {oid: i for i, oid in enumerate(occupation_ids)}

    scores: dict[tuple[str, str], float] = {}
    for i, oid_a in enumerate(occupation_ids):
        for j, oid_b in enumerate(occupation_ids):
            if i >= j:
                continue
            skills_a = occupation_skills[oid_a]
            skills_b = occupation_skills[oid_b]
            union = skills_a | skills_b
            if not union:
                continue
            jaccard = len(skills_a & skills_b) / len(union)
            if jaccard > 0.3:
                scores[(oid_a, oid_b)] = round(jaccard, 4)
    return scores
