# Bias-revisionsprotokoll

**Rättslig grund:** EU AI-förordning 2024/1689, Artikel 9 § 7.
**Schemaläggning:** Kvartalsvis via GitHub Actions
(`.github/workflows/quarterly-bias-audit.yml`).
**Implementering:** `services/data-pipeline/src/evaluate/bias_audit.py`.

## Syfte

Kontrollera att Crosstrees karriärrekommendationer inte systematiskt
avviker efter skyddade egenskaper enligt GDPR Artikel 9 och svensk
diskrimineringslagstiftning:

- Kön
- Ursprung / etnicitet (där proxydata finns)
- Ålder
- Funktionsvariation (i den mån data är tillgänglig)

## Metod

### 1. Disparate Impact Ratio (80%-regeln)

För varje skyddad grupp jämförs rekommendationsfrekvens med
referensgruppen. Om kvoten understiger 0.8 dokumenteras explicit
möjlig indirekt diskriminering, och åtgärd planeras.

### 2. Statistisk paritet

Jämför fördelningen av rekommendationsutfall (t.ex. medel-Fit-Score,
andel "match") mellan grupper. Signifikanta skillnader (t-test, p<0.05)
flaggas.

### 3. Counterfactual fairness

För ett urval av 50 CV:n: byt kön/ålder och kör om matchningen. Andel
fall där resultatet förändras > 10% rapporteras.

## Datakällor

- AF historiska annonser med demografisk metadata (där tillgängligt)
- SCB Yrkesregistret (AM0208) — sysselsättning per kön och ålder
- Anonymiserade aggregat från användarflödet (om opt-in)

## Output

Rapport publiceras i `docs/bias_audit_YYYYMMDD.md` med:

```
{
  "audit_date": "2026-05-17T04:00:00Z",
  "algorithm_version": "pagerank_v1.0",
  "occupations_tested": ["SSYK:3112", "SSYK:2511", ...],
  "disparate_impact_ratio": {
    "gender_female_vs_male": 0.94,
    "age_50plus_vs_under50": 0.91
  },
  "statistical_parity": {
    "gender": { "p_value": 0.42, "significant": false }
  },
  "counterfactual_fairness": {
    "gender_swap_change_pct": 4.2,
    "age_swap_change_pct": 6.8
  },
  "action_required": false,
  "notes": "Inga signifikanta avvikelser inom 80%-regeln."
}
```

## Tröskelvärden för åtgärd

| Mätvärde | Grön | Gul | Röd |
|---|---|---|---|
| Disparate Impact Ratio | ≥ 0.85 | 0.80–0.85 | < 0.80 |
| Counterfactual change | < 5% | 5–10% | > 10% |
| F0.5 benchmark | ≥ 0.85 | 0.80–0.85 | < 0.80 |

**Röd** → omedelbar tröskelanpassning eller modellrevision.
**Gul** → dokumenterad utredning inom 30 dagar.

## Förändringslogg

| Datum | Förändring | Ansvarig |
|---|---|---|
| 2026-05-18 | Initial version inför Kompetensrådet-demo | LM |
