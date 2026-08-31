# Systemarkitektur

## Översikt

```
Medborgare            Kompetensgrafen
    │                       │
    ▼                       ▼
TalentFlow           Kompetensgrafen
(Next.js → Vercel)   (Next.js → Vercel)
    │                       │
    └──────────┬────────────┘
               ▼
    FastAPI Matching API
       (Railway)
    ┌──────────┼──────────┐
    ▼          ▼          ▼
 Neo4j      Qdrant      Redis
 AuraDB     Cloud       (Railway)
(EU-west)  (EU-west)
```

## Dataflöde

1. **CV-uppladdning**: TalentFlow → `/cv/parse` → Claude AI → skill-ID:n → Redis-session
2. **Jobbmatchning**: skill-ID:n → `/match/score` → `calculate_fit_score()` → Wilson-CI
3. **Karriärgraf**: Neo4j SUBSTITUTABLE_BY-relationer → sortering på AF:s
   substituerbarhetspoäng → rekommenderade nästa steg.
   (PageRank ingår *inte* i den körande vägen. `compute_pagerank` i
   `data-pipeline/src/evaluate/pagerank_sensitivity.py` anropas endast från
   enhetstester. Se `docs/GRAFMATEMATIK_FARDPLAN.md` för vad som är byggt,
   specificerat respektive forskningsriktning.)
4. **Regional analys**: SCB PxWebApi → `/kompetensgrafen/brist` → BristTabell

## Skalning

- Railway autoskalning: max 3 instanser per tjänst
- Redis SWR (stale-while-revalidate) minskar upstream-belastning med ~80%
- Qdrant indexerar embeddings för sub-100ms vektorsökning
