# Crosstrees Labor Intelligence

AI-drivet infrastrukturlager för den svenska arbetsmarknaden.

## Produkter

| Produkt | URL | Målgrupp |
|---|---|---|
| TalentFlow | talentflow.crosstrees.se | Svenska medborgare |
| Kompetensgrafen | kompetensgrafen.crosstrees.se | Kompetensgrafen i Jönköpings län |

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

## Deployment

### Backend — Railway

1. Importera repot i Railway. Service-root: `services/matching-api`.
2. Sätt följande env-variabler i Railway-dashboarden:

```
NEO4J_URI=neo4j+s://<din-instans>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<lösenord>
CORS_ORIGINS=https://<din-vercel-url>,http://localhost:3000
ALGORITHM_VERSION=pagerank_v1.0
AF_JOBSEARCH_URL=https://jobsearch.api.jobtechdev.se
AF_TAXONOMY_URL=https://taxonomy.api.jobtechdev.se
AF_ENRICHMENTS_URL=https://jobad-enrichments.api.jobtechdev.se
AF_JOBED_URL=https://jobed-connect.api.jobtechdev.se
SCB_API_BASE=https://statistikdatabasen.scb.se/api/v2
JONKOPING_LAN_CODE=06
```

Optionellt (CV-parsing och chatt kräver detta):
```
ANTHROPIC_API_KEY=<din-nyckel>
CLAUDE_MODEL=claude-sonnet-4-6
REDIS_URL=<railway-plugin-url>
QDRANT_URL=<qdrant-cloud-url>
QDRANT_API_KEY=<qdrant-nyckel>
```

3. Verifiera deployen — kalla:
   - `GET https://<railway-url>/health` — JSON-status
   - `GET https://<railway-url>/demo/neo4j-check` — ska visa 22 yrken, 51 kompetenser,
     38 kanter. Siffrorna är seed-datans faktiska omfång
     (`services/matching-api/seed/`): 22 yrken, 51 kompetenser och 19 yrkespar
     lagrade som 38 riktade `SUBSTITUTABLE_BY`-relationer. Detta är hela
     datamängden i den körande databasen — den fullständiga ESCO-taxonomin laddas
     först när `python -m src.pipeline` körs mot en Neo4j-instans med satta
     `NEO4J_*`-secrets.

### Frontend — Vercel (två projekt)

Skapa två separata Vercel-projekt från samma repo:

**Kompetensgrafen:**
- Root Directory: `apps/kompetensgrafen`
- Vercel auto-detekterar Next.js
- Env: `NEXT_PUBLIC_API_URL=https://<railway-url>`

**TalentFlow:**
- Root Directory: `apps/talentflow`
- Env: `NEXT_PUBLIC_API_URL=https://<railway-url>`

### Neo4j AuraDB

Seed-data laddas via Cypher i Neo4j Browser (engångskörning) eller via
`services/data-pipeline/src/seed_loader.py`. Seed-filer ligger i
`services/data-pipeline/seed/`.

### Smoke-test efter deploy

```
curl https://<railway-url>/health
curl https://<railway-url>/demo/neo4j-check
curl https://<railway-url>/kompetensgrafen/sektorer
```

## Kontakt

linnea@crosstrees.se
