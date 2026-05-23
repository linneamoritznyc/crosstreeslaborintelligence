# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

AI-driven labour market infrastructure for Sweden. Two Next.js frontends (TalentFlow for citizens, Kompetensgrafen for regional planners in Jönköping County) backed by a single FastAPI matching API on Railway, a Neo4j skill graph, Qdrant vector search, and Redis cache.

## Monorepo layout

```
apps/kompetensgrafen/   Next.js 15 — regional analysis tool (Vercel)
apps/talentflow/        Next.js 15 — citizen job-matching tool (Vercel)
libs/shared-types/      TypeScript interfaces shared across apps
libs/ui-components/     Shared React components (Badge, ScoreBar, DataLabel)
services/matching-api/  FastAPI (Python 3.11) — Railway, Dockerfile build
services/data-pipeline/ ETL scripts + Neo4j seed loader (Python)
infra/neo4j/            Cypher schema
docs/                   Architecture, PRD, AI Act docs, runbook
```

## Commands

### Frontend (run from repo root)
```bash
pnpm install --no-frozen-lockfile   # first time or after package changes
pnpm dev                            # run all apps in parallel via Turbo
pnpm --filter=kompetensgrafen dev   # run one app only
pnpm build                          # build all
pnpm lint                           # lint all apps
```

### Backend (run from services/matching-api/)
```bash
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
pytest tests/unit/ -v               # unit tests only
```

### Data pipeline (run from services/data-pipeline/)
```bash
pip install -r requirements.txt
python src/seed_loader.py           # load seed data into Neo4j (one-time)
python src/pipeline.py              # full ETL run
pytest tests/ -v
```

## Architecture: how the pieces connect

All frontend data flows through `src/lib/api-client.ts` in each app, which reads `NEXT_PUBLIC_API_URL` and calls the Railway backend. There is no direct DB access from the frontend.

The matching API (`services/matching-api/src/main.py`) mounts routers under these prefixes:
- `/occupations`, `/skills`, `/recommend` — Neo4j graph queries via `services/graph.py`
- `/match` — Wilson-score fit scoring via `services/fit_score.py`
- `/cv` — Claude AI PDF parsing via `services/cv_parser.py`
- `/kompetensgrafen/*` — Jönköping-specific: SCB regional data, brist (shortage) map, ROI calc
- `/chatt` — RAG chat via Claude + Qdrant
- `/jobs`, `/trends`, `/jobed` — Arbetsförmedlingen API proxies

**Data flow for Kompetensgrafen:**
SCB PxWebApi → `/kompetensgrafen/brist` → `BristTabell` + `LanskartaD3` (D3.js county map)

**Data flow for TalentFlow:**
CV upload → `/cv/parse` → Claude extracts skill IDs → Redis session → `/match/score` → Wilson CI → ranked job list

## Deployment

### Vercel (frontends)
- **Vercel root directory**: `apps/kompetensgrafen` (or `apps/talentflow` for the second project)
- **Node.js version**: must be **22.x** in Vercel project settings (Build and Deployment → Node.js Version)
- Both `vercel.json` files use `npx --yes --package=pnpm@10.13.1 pnpm` to force the right pnpm version — Vercel's bundled pnpm 6.x breaks on Node 22+
- Required env var: `NEXT_PUBLIC_API_URL=https://<railway-url>`

### Railway (API)
- Service root: `services/matching-api`
- Builds via Dockerfile, starts with `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- Health check: `GET /health`
- Smoke test after deploy: `GET /demo/neo4j-check` (expects 22 occupations, 51 skills, 22 edges)

### Required Railway env vars
```
NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD
CORS_ORIGINS=https://<vercel-url>,http://localhost:3000
ALGORITHM_VERSION=pagerank_v1.0
AF_JOBSEARCH_URL, AF_TAXONOMY_URL, AF_ENRICHMENTS_URL, AF_JOBED_URL
SCB_API_BASE, JONKOPING_LAN_CODE=06
ANTHROPIC_API_KEY, CLAUDE_MODEL=claude-sonnet-4-6   # required for /cv and /chatt
REDIS_URL, QDRANT_URL, QDRANT_API_KEY               # required for /chatt
```

## Rules (from docs/OPTIMIZED_CODEBASE_GUIDELINES.md)

- No hardcoded data in UI — all data comes from the API
- No `Math.random()` — use deterministic algorithms or crypto random
- No local dev DB — always deploy API to Railway, point `NEXT_PUBLIC_API_URL` there
- API errors return `None`/empty list, never fabricated fallback values
- All confidence intervals use Wilson-score (never return a match score without CI)
- Max 200 lines per file
- Conventional Commits required: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- UI text in Swedish; use å, ä, ö correctly — never substitute with a/o
- Named TTL constants from `cache.py` — no magic numbers for Redis TTLs
- CORS locked to production domains via `CORS_ORIGINS` env var

## CI

GitHub Actions runs on push to `main` and PRs:
- `commitlint` — enforces Conventional Commits on every push
- `test-python` — pytest unit tests (only when `services/` changes)
- `test-typescript` — pnpm lint (only when `apps/` changes)  
- `lint-python` — ruff on all Python
