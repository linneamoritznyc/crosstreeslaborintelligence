# SESSION NOTES — Analys Page Rebuild

Date: 2026-05-26
Branch: main
Commits: b2f48f2 and prior in this session

## What Was Built

Complete rebuild of `/analys/[sektor]` in `apps/kompetensgrafen`. The page now
has 10 sections matching the Crosstrees design system spec.

### Components created (all in `apps/kompetensgrafen/src/components/analys/`)

| File | Type | Description |
|---|---|---|
| `SectorHero.tsx` | client | 90-dot animated canvas, SVG nautical contours, sector H1 with rust word |
| `StatsBand.tsx` | server | Three stat cells: employees, shortage %, forecast 2040 |
| `Bristkarta.tsx` | client | D3 Voronoi choropleth, rust-intensity fill, graticule, compass rose |
| `BristyrkenTable.tsx` | server | Top-10 shortage occupations with rank, SSYK, shortage % |
| `OmstallningsCanvas.tsx` | client | 44-node animated career graph, traveling dot, top-5 transitions list |
| `ROIBlock.tsx` | client | Three-column ROI grid + live slider (10–500 omställningar) |
| `NastaSteg.tsx` | server | Three ghost-style CTAs to next steps |
| `career-graph-data.ts` | data | Hardcoded 44-node graph, 24 edges, highlight path, top transitions |

### Supporting file
`apps/kompetensgrafen/src/lib/sektor-data.ts` — sector names, rust accent words,
subheads for all 7 sectors (vard, industri, bygg, it, logistik, service, utbildning).

### CSS additions (appended to `apps/kompetensgrafen/src/app/globals.css`)
`.rope-divider`, `.analys-h2`, `.analys-subhead`, `.rust-eyebrow`, `.stats-band`,
`.stats-cell`, `.stats-val`, `.stats-note`, `.brist-row`, `.analys-two-col`,
`.roi-grid`, `.roi-cell`, `.nasta-row`

## API Endpoints Created

### `GET /kompetensgrafen/sector-stats?sektor={slug}`
Returns employment count, shortage %, forecast year per sector.
**Data source: PLACEHOLDER**. All values are hardcoded in
`services/matching-api/src/services/kompetensgrafen_service.py` → `_SECTOR_STATS`.
TODO: Wire up real SCB Yrkesregistret + AF Yrkesbarometern data.

### `GET /kompetensgrafen/top-shortage-occupations?sektor={slug}`
Returns top-10 occupations in the sector ranked by AF Platsbanken ad count,
with a relative `shortage_pct` computed as `(brist_index / max) * 82 + 10`.
**Data source: LIVE AF Platsbanken** (via existing `get_brist_for_sektor`),
but `shortage_pct` scaling is a placeholder.
TODO: Replace relative scaling with real AF Yrkesbarometern shortage index.

## Placeholder Data Locations

| What | Where | TODO |
|---|---|---|
| Sector employment counts | `kompetensgrafen_service.py::_SECTOR_STATS` | Wire SCB Yrkesregistret |
| Shortage % per sector | Same dict | Wire AF Yrkesbarometern |
| shortage_pct scaling formula | `get_top_shortage_occupations()` | Use real bristindex from AF |
| Career graph (44 nodes, 24 edges) | `career-graph-data.ts` | Derive from Neo4j SUBSTITUTABLE_BY |
| Top transitions list | `career-graph-data.ts::TOP_TRANSITIONS` | Compute from graph traversal |

## Map Data

The Bristkarta uses **Voronoi / Thiessen polygons** derived from the 13 SCB
centroid coordinates in `kompetensgrafen_geo.py`. These are not real municipality
polygon boundaries. For production, replace with the SCB Geodata RegSO 2025
GeoJSON file. See `ARCHITECTURE.md` for the planned `/api/geo/jonkoping` endpoint.

## Pages Not Yet Implemented (slug destinations)

The following links exist in the new page but their target pages are not built:
- `/analys/{sektor}/kommun/{slug}` — per-municipality deep dive
- `/analys/{sektor}/yrke/{slug}` — per-occupation omställningsanalys
- `/analys/{sektor}/yrken` — full occupation list
- `/analys/{sektor}/roi` — customised ROI calculator
