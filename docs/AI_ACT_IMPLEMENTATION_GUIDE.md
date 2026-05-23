# EU AI Act — Implementeringsguide

## Riskklassificering

Crosstrees klassificeras som **högrisk-AI-system** enligt EU AI Act Bilaga III, punkt 4:
*"AI-system som används för rekrytering eller urval av fysiska personer, i synnerhet för att annonsera lediga platser, granska och filtrera ansökningar, utvärdera kandidater i intervjuer och tester."*

## Krav och implementering

### Artikel 9 — Riskhanteringssystem
- **Krav**: Kontinuerlig riskidentifiering och -minskning
- **Implementation**: Kvartalsvisa biasrevisioner (`quarterly-bias-audit.yml`)
- **Tröskelvärde**: Paritet ≥0.80 för kön, ålder, utbildningsnivå

### Artikel 10 — Datakvalitet
- **Krav**: Tränings- och testdata ska vara representativa och fria från bias
- **Implementation**: `bias_audit.py` granskar matchningsutfall per demografigrupp
- **Dokumentation**: Revisionsrapporter sparas 6 månader (Redis TTL)

### Artikel 12 — Loggning
- **Krav**: Automatisk loggning av AI-systemets drift
- **Implementation**: `AI_ACT_LOG_RETENTION = 15_552_000` (6 månader) i `cache.py`
- **Format**: Strukturerad JSON via structlog

### Artikel 13 — Transparens
- **Krav**: Användare ska informeras om att de interagerar med ett AI-system
- **Implementation**: Tydlig information i TalentFlow UI om AI-driven matchning

### Artikel 14 — Mänsklig tillsyn
- **Krav**: Möjlighet till mänsklig override av AI-beslut
- **Implementation**: Kompetensgrafen-handläggare kan åsidosätta algoritmiska rekommendationer

### Artikel 17 — Kvalitetsledningssystem
- **Krav**: Dokumenterat QMS
- **Implementation**: Detta dokument + RUNBOOK.md + kvartalsrapporter

## Incident Response

Vid bias-detektering (paritet <0.80):
1. GitHub-issue skapas automatiskt med etikett `ai-act-compliance`
2. Åtgärdsplan dokumenteras inom 30 dagar
3. Korrigerande åtgärd implementeras och verifieras i nästa kvartalsgranskning
