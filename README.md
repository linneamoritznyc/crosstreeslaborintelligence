# Crosstrees Labor Intelligence

AI-drivet infrastrukturlager för den svenska arbetsmarknaden.

## Produkter

| Produkt | URL | Målgrupp |
|---|---|---|
| TalentFlow | talentflow.crosstrees.se | Svenska medborgare |
| Kompetensrådet | kompetensradet.crosstrees.se | Kompetensrådet i Jönköpings län |

## Arkitektur

- **Backend:** FastAPI (Python) → Railway
- **Frontend:** Next.js 15 App Router → Vercel (två separata projekt)
- **Graf:** Neo4j AuraDB (EU-region)
- **Vektorsökning:** Qdrant Cloud (EU-region)
- **Cache:** Redis (Railway-plugin)
- **CI/CD:** GitHub Actions

## Dokumentation

Se `docs/` för fullständig teknisk dokumentation:

- `OPTIMIZED_CODEBASE_GUIDELINES.md` — Tekniska principer och regler
- `NEW_REPO_SPEC.md` — Komplett byggritning
- `PRD_CROSSTREES_v1.md` — Produktkravsdokument
- `AI_ACT_IMPLEMENTATION_GUIDE.md` — EU AI Act-efterlevnad
- `ARCHITECTURE.md` — Systemarkitektur
- `DATA_SOURCES.md` — Datakällor och register
- `RUNBOOK.md` — Driftprocedurer

## Data

Bygger på Arbetsförmedlingens öppna API:er (jobtechdev.se) och
SCB:s öppna data via PxWebApi 2 (statistikdatabasen.scb.se/api/v2).
Licens: CC0 (SCB), öppen utan krav (AF).

## AI Act

Crosstrees klassificeras som högrisk-AI-system (Bilaga III, punkt 4).
Se `docs/AI_ACT_IMPLEMENTATION_GUIDE.md`.

## Kontakt

linnea@crosstrees.se
