"""Analyserar känslighet i PageRank-vägda karriärgrafer."""
import numpy as np
from typing import Any


def compute_pagerank(
    adjacency: dict[str, list[tuple[str, float]]],
    damping: float = 0.85,
    iterations: int = 100,
) -> dict[str, float]:
    nodes = list(adjacency.keys())
    n = len(nodes)
    if n == 0:
        return {}

    idx = {node: i for i, node in enumerate(nodes)}
    ranks = np.ones(n) / n

    for _ in range(iterations):
        new_ranks = np.ones(n) * (1 - damping) / n
        for node, neighbors in adjacency.items():
            total_weight = sum(w for _, w in neighbors)
            if total_weight == 0:
                continue
            for neighbor, weight in neighbors:
                new_ranks[idx[neighbor]] += damping * ranks[idx[node]] * weight / total_weight
        ranks = new_ranks

    return {node: float(ranks[i]) for node, i in idx.items()}
