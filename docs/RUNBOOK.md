# Driftprocedurer (Runbook)

## taxonomy-sync-failure

**Symptom**: `taxonomy-sync` GitHub Actions-jobb misslyckas.

**Steg**:
1. Kontrollera `AF_TAXONOMY_URL` är nåbar: `curl https://taxonomy.api.jobtechdev.se/v1/taxonomy/main/concepts?limit=1`
2. Kontrollera Neo4j AuraDB-status på Neo4j Aura Console
3. Kör `workflow_dispatch` manuellt efter åtgärd

## af-api-schema-change

**Symptom**: `contract-tests` misslyckas dagligen.

**Steg**:
1. Granska felmeddelandet — vilket fält saknas?
2. Uppdatera `tests/contract/test_af_api_schema.py` med nytt schema
3. Uppdatera berörda serviceklasser i `services/matching-api/src/services/`
4. Pusha fix och verifiera att kontraktstesterna är gröna

## job-sync-failure

**Symptom**: `job-sync` misslyckas.

**Steg**:
1. Verifiera `AF_JOBSEARCH_URL`: `curl "https://jobsearch.api.jobtechdev.se/search?limit=1"`
2. Kontrollera rate-limiting (max 10 req/s mot Platsbanken)
3. Kör om via `workflow_dispatch`

## trends-sync-failure

**Symptom**: `trends-sync` misslyckas.

**Steg**:
1. Verifiera att jobtechdev.se-API:erna svarar
2. Kontrollera Redis-anslutning: `redis-cli -u $REDIS_URL ping`

## bias-audit-failure

**Symptom**: `quarterly-bias-audit` misslyckas.

**Steg**:
1. Granska loggar för vilket paritetsmått som understiger 0.80
2. EU AI Act Artikel 9 kräver dokumentation av åtgärd inom 30 dagar
3. Skapa GitHub-issue med etikett `ai-act-compliance`
4. Dokumentera i `docs/AI_ACT_IMPLEMENTATION_GUIDE.md`
