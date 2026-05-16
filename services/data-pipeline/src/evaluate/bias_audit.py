"""Kvartalsgranskning av algoritmisk bias i matchningsresultat — EU AI Act Artikel 9."""
from dataclasses import dataclass
import structlog

log = structlog.get_logger()


@dataclass
class BiasReport:
    kön_paritet: float
    ålder_paritet: float
    utbildningsnivå_paritet: float
    flaggor: list[str]


def audit_match_results(results: list[dict]) -> BiasReport:
    flaggor: list[str] = []

    kön_scores: dict[str, list[float]] = {}
    ålder_scores: dict[str, list[float]] = {}
    utbildning_scores: dict[str, list[float]] = {}

    for r in results:
        score = r.get("score", 0.0)
        kön = r.get("kön", "okänt")
        åldersgrupp = r.get("åldersgrupp", "okänd")
        utbildning = r.get("utbildningsnivå", "okänd")

        kön_scores.setdefault(kön, []).append(score)
        ålder_scores.setdefault(åldersgrupp, []).append(score)
        utbildning_scores.setdefault(utbildning, []).append(score)

    def paritet(grupp_scores: dict[str, list[float]]) -> float:
        means = {k: sum(v) / len(v) for k, v in grupp_scores.items() if v}
        if len(means) < 2:
            return 1.0
        min_m, max_m = min(means.values()), max(means.values())
        return min_m / max_m if max_m > 0 else 1.0

    kön_par = paritet(kön_scores)
    ålder_par = paritet(ålder_scores)
    utb_par = paritet(utbildning_scores)

    if kön_par < 0.8:
        flaggor.append(f"Könsdisparitet: paritet={kön_par:.2f} (tröskel 0.80)")
    if ålder_par < 0.8:
        flaggor.append(f"Åldersdisparitet: paritet={ålder_par:.2f} (tröskel 0.80)")
    if utb_par < 0.8:
        flaggor.append(f"Utbildningsdisparitet: paritet={utb_par:.2f} (tröskel 0.80)")

    report = BiasReport(
        kön_paritet=round(kön_par, 4),
        ålder_paritet=round(ålder_par, 4),
        utbildningsnivå_paritet=round(utb_par, 4),
        flaggor=flaggor,
    )
    log.info("bias_audit.completed", flaggor=len(flaggor), rapport=report)
    return report
