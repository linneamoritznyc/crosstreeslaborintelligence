# Crosstrees Labor Intelligence — Teknisk dokumentation enligt EU AI Act

**Version:** 1.0
**Datum:** 2026-05-23
**Författare:** Linnea Moritz, Crosstrees Labor Intelligence
**Rättslig grund:** Förordning (EU) 2024/1689, Artikel 11 och Bilaga IV

## 1. Systembeskrivning

### 1.1 Övergripande
**Produktnamn:** Crosstrees Labor Intelligence
**Operatör (provider):** Crosstrees Labor Intelligence, Vetlanda, Sverige
**Kontakt:** kontakt@crosstrees.se
**Marknad:** Sverige, primärt Jönköpings län
**Driftsmiljö:** Molnbaserad (Railway, Vercel, Neo4j AuraDB, Qdrant Cloud — samtliga EU-region)

### 1.2 Avsedd användning
Systemet består av två separata produkter med distinkta målgrupper:

| Produkt | Målgrupp | Syfte |
|---|---|---|
| TalentFlow | Svenska medborgare | Kostnadsfritt karriärverktyg — CV-baserad matchning mot Platsbankens annonser och AF:s substitutabilitetsgraf |
| Kompetensrådet | Regionalt Kompetensråd (B2G) | Beslutsunderlag för YH-utbildningar, omställningsinsatser och kompetensförsörjning |

### 1.3 AI-systemets klassificering
Båda produkterna klassificeras som **högrisk-AI-system** enligt **Bilaga III, punkt 4**
("AI-system som används för rekrytering eller urval av fysiska personer, för att
analysera och filtrera arbetsansökningar och utvärdera kandidater").

Motivering: Crosstrees genererar algoritmiska rekommendationer som påverkar
medborgares tillgång till sysselsättning. En låg fit-poäng kan leda till att
en medborgare avstår från att söka en tjänst.

## 2. Algoritmiska komponenter

### 2.1 Trelagrad matchningsalgoritm
Crosstrees kombinerar tre oberoende beräkningar för varje matchning:

**Lager 1 — Semantiskt (NLP + vektorembeddings)**
- Modell: Anthropic Claude (`claude-sonnet-4-6`) för CV-parsing
- Vektorrepresentation: Qdrant hybrid (dense + sparse BM25)
- Tröskel: empiriskt bestämd via F0.5-benchmark på 500+ manuellt märkta kompetenspar

**Lager 2 — Taxonomiskt (ESCO + SSYK + AF substitutabilitet)**
- Källa: Arbetsförmedlingens taxonomi-API (`taxonomy.api.jobtechdev.se`)
- Grafdatabas: Neo4j AuraDB med GDS-plugin
- Algoritm: Personalized PageRank med Louvain-community-detektion

**Lager 3 — Regionalt (lokala arbetsmarknadsförhållanden)**
- Källa: AF Platsbanken (live), AF Yrkesbarometern (halvårsvis), SCB Yrkesregistret
- Geografisk filtrering: Jönköpings länskod 06

### 2.2 Fit-score-beräkning (TalentFlow + Kompetensrådet)
Viktad TF-IDF-intersection med Wilson-score-konfidensintervall:

```
score = (matchade_required_idf / required_idf_total) × 0.60
      + (matchade_preferred_idf / preferred_idf_total) × 0.40
      (× 100 för procent)
```

Konfidensintervall via Wilson-score 95% (z=1.96). Returnerar **None** om
jobbdata saknas — aldrig fabricerade default-värden.

### 2.3 ROI-kalkylator (Kompetensrådet)
Bootstrap-resampling (n=1000) över historiska placeringsgrader per sektor.
Returnerar 95%-konfidensintervall via 2.5- och 97.5-percentilen. Punkt-
estimat utan CI är aldrig acceptabelt.

### 2.4 Algoritmiska parametrar — empirisk grund
| Parameter | Värde | Grund |
|---|---|---|
| `semantic_threshold` | benchmark-baserad | F0.5 på 500+ labeled pairs |
| `pagerank_damping` | känslighetsanalys | Korrelation mot AF historiska övergångar |
| `wilson_z` | 1.96 | 95% KI, standard |
| `bootstrap_n` | 1000 | Tillräcklig för 95% KI inom ±1% bredd |
| `cache.serve_ttl` (jobs) | 900s | AF Platsbankens uppdateringsfrekvens |

Varje parameter versioneras via `perf:`-commits i Conventional Commits.

## 3. Träningsdata och dataset

| Datakälla | Typ | Licens | Bevarandetid | Senaste uppdatering |
|---|---|---|---|---|
| AF Substitutabilitetsdata | JSON-fil, öppen | Öppen | Persistent | 2026-05 |
| AF Taxonomi (yrken, kompetenser) | REST API | Öppen | Pipeline-veckovis | Daglig synk |
| AF Platsbanken (annonser) | REST API | Öppen | Redis 15 min | Live |
| AF Enrichments | REST API | Öppen | Ingen | Per anrop |
| AF JobEd Connect | REST API | Öppen | 7 dagar | Pipeline-veckovis |
| AF Yrkesbarometern | PDF/CSV manuell | Öppen | Persistent | Halvårsvis |
| SCB Lönestrukturstatistik (AM0110) | PxWebApi 2 | CC0 | Persistent | Löneår 2024, pub. 2025-06-17 |
| SCB Yrkesregistret (AM0208) | PxWebApi 2 | CC0 | Persistent | Årsvis |
| SCB Geodata RegSO 2025 | GeoJSON | CC0 | Persistent | 2025 |
| ESCO-kompetenstaxonomi | RDF | Open Data EU | Persistent | v1.1.1 (2024) |
| Anthropic Claude (inferens) | API | Proprietär | Inget data sparas | Modell `claude-sonnet-4-6` |

**Inget CV-innehåll, inga personuppgifter lagras persistent i v1.**
Pseudonymiserade session-ID:n i Redis med 1h TTL.

## 4. Prestanda och kvalitetsmätning (Artikel 12)

### 4.1 Tekniska metriker (kontinuerlig mätning)
| Metrik | Mål | Källa |
|---|---|---|
| CV-parsing (async, p95) | < 4s | OpenTelemetry-spans |
| Jobblista (cachad, p50) | < 30ms | Strukturerad loggning |
| Karriärgraf (Neo4j, p95) | < 150ms | Cypher EXPLAIN |
| API-tillgänglighet | > 99,5% | Railway uptime + Pingdom |

### 4.2 Produktkvalitetsmetriker (daglig mätning)
| Metrik | Mål |
|---|---|
| Andel CV med ≥1 match | > 85% |
| Genomsnittlig Fit Score | > 55,0 |
| Andel karriärrekommendationer med ≥1 live-ledig tjänst | > 90% |

### 4.3 Benchmarkning
- **F0.5-similarity benchmark** — körs vid varje threshold-ändring, 500+ labeled pairs
- **PageRank dampingfaktor — känslighetsanalys** mot AF historiska övergångsdata
- **Bias-audit (kvartalsvis)** — körs via GitHub Actions schemaläggning

## 5. Loggning och spårbarhet (Artikel 12)

### 5.1 AI Act-loggfält
Varje algoritmisk inferens loggas med följande fält i strukturerad JSON:

```json
{
  "timestamp": "ISO 8601 UTC",
  "request_id": "ULID",
  "session_id": "pseudonymiserat UUID",
  "algorithm_version": "pagerank_v1.0",
  "threshold_version": "benchmark_2026-05-01",
  "occupation_input": "SSYK-kod, aldrig fritext med PII",
  "recommendations_count": int,
  "fit_scores_range": [min, max],
  "data_sources_used": ["af_live", "neo4j_taxonomy_2026-05-12"],
  "ai_act_risk_class": "high_risk",
  "human_oversight_available": true
}
```

### 5.2 Persistens
Algoritmiska beslutsprotokollet sparas i **PostgreSQL** (separat från Redis-cachen)
med 6 månaders bevarandetid enligt Artikel 12 §1.

CV-innehåll och parsningsresultat lagras endast i Redis med 1h TTL.

## 6. Riskhantering (Artikel 9)

Se `docs/RISK_REGISTER.md` för fullständigt riskregister. Sammanfattat:

| Risk-ID | Risk | Sannolikhet | Allvar | Åtgärd |
|---|---|---|---|---|
| R-01 | Systematisk snedvridning mot yrkesgrupper | Medel | Hög | Bias-revision kvartalsvis |
| R-02 | Föråldrade AF-data | Låg | Medel | Datumstämpel i UI, pipeline-monitorering |
| R-03 | ESCO-taxonomiändring | Låg | Hög | Nattliga kontrakttest |
| R-04 | Beslut endast baserat på Fit Score | Medel | Hög | Obligatorisk förklaring i UI |
| R-05 | Indirekt diskriminering kön/ursprung | Medel | Mkt hög | Demografisk disaggregering |

## 7. Mänsklig tillsyn (Artikel 14)

Systemet fattar inga autonoma beslut. Varje algoritmisk utdata är:

1. **Märkt som rekommendation** — aldrig "beslut"
2. **Förklarlig** — kompetensuppdelning visas (matchade gröna, saknade röda)
3. **Granskningsbar** — alla datakällor klickbara, alla antaganden synliga
4. **Med konfidensintervall** — Wilson 95% KI eller bootstrap 95% KI

Obligatoriska AI Act-fraser injiceras automatiskt:

- **TalentFlow CV-uppladdning:** informationstext före upload (se README)
- **Varje Fit Score:** komponent `<AIActDisclaimer variant="score" />`
- **Kompetensrådet AI-chatt:** Systemmeddelande prependerar och appenderar
  obligatoriska fraser ("Som AI-system analyserar jag följande data…" / "Detta
  är en AI-genererad analys. Beslut fattas av ansvarig handläggare…")

## 8. Transparens (Artikel 13)

### 8.1 Information till slutanvändare
Visas innan CV-uppladdning på TalentFlow:

> Det här systemet använder AI för att analysera dina yrkeskompetenser och
> generera karriärrekommendationer. Det är ett AI-system med hög risk enligt
> EU:s AI-förordning (EU 2024/1689). Resultaten är rekommendationer, inte
> beslut. Du fattar alltid det slutliga beslutet om dina ansökningar och din
> karriär.

### 8.2 Datakällsindikatorer
Komponenten `<DataLabel source=… date=…/>` visas under varje datapunkt med
källa och datum. Krav: TF-05, KR-10 i PRD.

## 9. Kvalitetsledningssystem (Artikel 17)

Crosstrees kvalitetsledningssystem omfattar:

- **Versionshantering:** Conventional Commits, signed-off-by, paths-filtered CI
- **Algoritmversion:** publicerad i `/health`-endpoint och inkluderad i varje matchning
- **Inspelningsbarhet:** algoritmiska parametrar visas med benchmark-referens i UI
- **Förändringskontroll:** `perf:`-commits krävs vid parameteruppdatering med
  fullständig motivering
- **Dokumentation:** detta dokument uppdateras vid varje versionsökning av
  produkten

## 10. Incidenthantering (Artikel 73)

Se `docs/INCIDENT_RESPONSE.md`. Sammanfattning:

- **Allvarlig incident** definieras som: (a) felaktig medborgarbeslutspåverkan,
  (b) systematisk snedvridning, eller (c) CV-innehållsläckage.
- **Anmälningsplikt:** 15 dagar till behörig marknadstillsynsmyndighet
  (i Sverige: IMY för dataskydd, Konsumentverket för konsumentskydd).
- **Eskalationskedja:** tekniskt team (< 2h) → produktägare (< 4h) → juridisk
  bedömning (< 24h) → myndighetanmälan (< 15 dygn).

## 11. Granskningsbarhet och tredjepartsutvärdering

- **Källkod:** öppen för granskning vid förfrågan (NDA möjlig vid behov)
- **Algoritmiska parametrar:** publika i `/health`-endpoint
- **Bias-revisionsrapporter:** publiceras i `docs/bias_audit_YYYYMMDD.md` kvartalsvis
- **Datakällsregister:** `docs/DATA_SOURCES.md`

## 12. Versionshistorik för detta dokument

| Datum | Version | Ändring |
|---|---|---|
| 2026-05-23 | 1.0 | Initialt dokument inför pilot Q3 2026 |
