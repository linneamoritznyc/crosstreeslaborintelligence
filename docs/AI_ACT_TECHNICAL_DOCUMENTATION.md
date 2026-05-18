# AI Act — Teknisk dokumentation

**Rättslig referens:** EU AI-förordning 2024/1689, Artikel 11 + Bilaga IV.
**Status:** Levande dokument, uppdateras vid varje algoritm- eller modellförändring.
**Versionsansvar:** Linnea Moritz, Crosstrees Labor Intelligence.

## 1. Systembeskrivning

| Egenskap | Värde |
|---|---|
| Systemnamn | Crosstrees Labor Intelligence |
| Riskklass | Högrisk (Bilaga III punkt 4 — rekrytering/urval) |
| Avsedd användning | Karriärmatchning för medborgare (TalentFlow), beslutsstöd för Kompetensrådet (regionalt) |
| Geografi | Sverige, primärt Jönköpings län |
| Operatör | Crosstrees Labor Intelligence AB, Vetlanda |
| Algoritmversion | `pagerank_v1.0` / `roi_bootstrap_v1.0` |
| Modellberoende | Anthropic Claude Sonnet 4.6 (kompetensextraktion, AI-rådgivare) |

## 2. Algoritmiska komponenter

| Komponent | Metod | Empirisk grund | Versionshantering |
|---|---|---|---|
| Karriärövergångar | Personalized PageRank (Neo4j GDS) | Känslighetsanalys på AF historiska övergångsdata | `pagerank_damping` i `/health` |
| Kompetenslikhet | Hybrid BM25 + dense (Qdrant) | F0.5-benchmark på ≥500 manuellt märkta par | `semantic_threshold` i `/health` |
| Fit Score | Tidsviktad TF-IDF, 60% required / 30% preferred / 10% bonus | AF Platsbankens annonsdata, viktning baserad på `recency_weight=2.0` | `fit_score_method` |
| Konfidensintervall (matchning) | Wilson score 95% | n_required, p_hat | Inbyggd i fit_score-utdata |
| ROI | Bootstrap med 1 000 dragningar | MYH årsrapporter 2018–2024, placeringsgrad | `roi_bootstrap_v1.0` |

## 3. Träningsdata och dataset (Artikel 10)

**Notera:** Crosstrees använder inga egentränade modeller. Systemet är ett
analysverktyg som kombinerar regelbaserade algoritmer (PageRank, TF-IDF) med
externa språkmodeller (Claude). Endast Claude utgör en "AI-modell" i AI Aktens
tekniska bemärkelse — och Anthropic ansvarar för dokumentationen av den modellen.

Datakällor som systemet använder:

| Källa | Version/datum | Licens | Uppdateringsfrekvens |
|---|---|---|---|
| AF Taxonomy API | Live | Öppen | Veckovis sync |
| AF Substitutabilitetsdata | 2024-12 | Öppen | Vid release |
| AF Platsbanken | Live | Öppen | 15 min cache |
| AF Historiska annonser | 2006– | Öppen | Daglig sync |
| ESCO-kompetenstaxonomi | v1.1.1 (2024) | EU-licens | Vid ny version |
| SCB Lönestrukturstatistik (AM0110) | Löneår 2024 | CC0 | Årligen |
| SCB Lediga jobb (AM0208) | 2024-Q4 | CC0 | Kvartalsvis |
| SCB Geodata RegSO 2025 | 2025-01-15 | CC0 | Vid omindelning |
| SCB Befolkning (BE0101) | 2024-12-31 | CC0 | Årligen |
| MYH årsrapporter | 2018–2024 | Öppen | Årligen |

## 4. Prestandamätvärden

Mätvärden publiceras dagligen i `/health` och i daglig pipeline-rapport.

- **Fit Score-täckning:** andel CV som genererar ≥1 match (mål: >85%)
- **Genomsnittlig Fit Score:** mål >55.0
- **Rekommendationsrelevans:** andel rekommenderade övergångar med ≥1 live-ledig tjänst (mål: >90%)
- **Latens p50/p95:** per endpoint (mål p95 <150ms för cachade, <4s för CV-parsing)
- **Senast benchmark F0.5:** mål >0.85, varning vid <0.80
- **API-tillgänglighet:** mål >99.5%

## 5. Loggning och spårbarhet (Artikel 12)

Systemet loggar varje algoritmiskt beslut till `structlog`-stream (Railway
log drain) med följande fält:

```json
{
  "timestamp": "2026-05-17T10:23:41Z",
  "request_id": "req_abc123",
  "session_id": "anon_hash_xyz",
  "algorithm_version": "pagerank_v1.0",
  "threshold_version": "benchmark_2026-05-01",
  "occupation_input": "SSYK:3112",
  "recommendations_count": 8,
  "fit_scores_range": [34.2, 87.1],
  "data_sources_used": ["af_live", "neo4j_taxonomy_2026-05-12"],
  "ai_act_risk_class": "high_risk",
  "human_oversight_available": true
}
```

**Persistens:** Loggar levereras via Railway log drain till persistent
loggsystem med minst 6 månaders bevarandetid enligt Artikel 12 § 1.
**Inga persondata loggas** — session_id är pseudonymiserad,
occupation_input är SSYK-kod, CV-text loggas aldrig.

**Roadmap v2:** PostgreSQL-baserat beslutsprotokoll för enklare granskning
och query.

## 6. Mänsklig tillsyn (Artikel 14)

- Varje algoritmisk utdata märks i UI som "AI-genererad rekommendation".
- Fit Score visas alltid med kompetensuppdelning (matchade vs saknade) och
  Wilson-konfidensintervall.
- ROI visas alltid med bootstrap-CI, aldrig som punktestimat.
- AI-chatten inleder och avslutar varje svar med obligatoriska AI Act
  Art. 50-fraser.
- CV-uppladdning kräver explicit godkännande av AI Act-information.
- Inga autonoma beslut fattas — alla beslut hänvisas tydligt till
  människa (medborgare eller handläggare vid Kompetensrådet).

## 7. Riskhantering (Artikel 9)

Se [`RISK_REGISTER.md`](./RISK_REGISTER.md) för fullständigt register
och [`BIAS_AUDIT_PROTOCOL.md`](./BIAS_AUDIT_PROTOCOL.md) för
kvartalsvis bias-revision.

## 8. Incidenthantering (Artikel 73)

Se [`INCIDENT_RESPONSE.md`](./INCIDENT_RESPONSE.md).

## 9. Förändringslogg

| Datum | Version | Förändring | Ansvarig |
|---|---|---|---|
| 2026-05-18 | 1.0 | Initial dokumentation inför demo Kompetensrådet | LM |
