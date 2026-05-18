# Riskregister — Crosstrees Labor Intelligence

**Rättslig grund:** EU AI-förordning 2024/1689, Artikel 9.
**Uppdateras:** Vid varje algoritmändring och kvartalsvis vid bias-revision.

## Riskmatris

| ID | Beskrivning | Sannolikhet | Allvar | Mitigering | Status |
|---|---|---|---|---|---|
| R-01 | Systematisk snedvridning mot vissa yrkesgrupper i karriärrekommendationer | Medel | Hög | Kvartalsvis bias-revision (`evaluate/bias_audit.py`), demografisk disaggregering av rekommendationsutfall | Aktiv övervakning |
| R-02 | Föråldrade AF-data leder till felaktiga rekommendationer | Låg | Medel | Datumstämpel i UI på varje datapunkt, pipeline-monitorering med Slack-larm vid sync-fel | Mitigerad |
| R-03 | ESCO-taxonomiändring bryter kompetensmatching | Låg | Hög | Nattliga kontraktstester (`tests/contract/`), versionsdetektering i pipeline | Mitigerad |
| R-04 | Användare fattar karriärbeslut baserat enbart på Fit Score | Medel | Hög | Obligatorisk kompetensuppdelning i UI (matchade + saknade), Wilson-CI, AI Act-förbehåll | Mitigerad |
| R-05 | Oavsiktlig diskriminering efter kön, ursprung eller ålder | Medel | Mycket hög | Bias-audit per kvartal, 80%-regeln (disparate impact ratio), demografisk disaggregering | Aktiv övervakning |
| R-06 | CV-innehåll läcker via loggar eller cache | Låg | Mycket hög | `log_body=False` på `/cv/parse`, Redis-TTL 1h, inga persondata i strukturerade loggar | Mitigerad |
| R-07 | Anthropic API otillgänglig stoppar CV-parsing | Medel | Medel | Cirkelbrytare med exponentiell backoff, tydligt felmeddelande till användare | Mitigerad |
| R-08 | ROI-kalkyl används på felaktig sektor utan kontextuell granskning | Medel | Medel | Alla antaganden synliga i UI och PDF, bootstrap-CI istället för punktestimat | Mitigerad |
| R-09 | AI-chatten genererar svar utanför datakontexten | Låg | Hög | Strikt systemprompt med "svara bara baserat på data du har", obligatoriska Art. 50-fraser | Mitigerad |
| R-10 | Geografisk data felmappar kommun | Låg | Medel | SCB Geodata RegSO 2025-koder hårdkodade, ingen runtime-fabricering | Mitigerad |

## Eskalation

1. Lågt: dokumenteras i nästa kvartalsvisa bias-rapport.
2. Medel: tekniskt team adresserar inom 30 dagar.
3. Hög/Mycket hög: omedelbar tekniskt team-respons, eventuellt incident enligt
   Artikel 73 (se `INCIDENT_RESPONSE.md`).

## Förändringslogg

| Datum | Förändring | Ansvarig |
|---|---|---|
| 2026-05-18 | Initial version inför Kompetensrådet-demo | LM |
