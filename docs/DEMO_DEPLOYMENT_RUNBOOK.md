# Demo Deployment Runbook — Kompetensrådet

**Mål:** Få Kompetensrådet-demon publik på `kompetensradet.crosstrees.se`
(eller en `*.vercel.app`-URL) inom 30 minuter.

## Förutsättningar

- GitHub-repo `linneamoritznyc/crosstreeslaborintelligence` med branchen
  `claude/prepare-demo-deployment-qSKUD` (eller `main` om du mergat).
- Vercel-konto kopplat till GitHub.
- Backend (FastAPI) deployad på Railway och nåbar på en publik URL.

## Steg 1 — Verifiera FastAPI-backend (Railway)

1. Logga in på railway.app.
2. Öppna projektet `crosstrees-api` (eller motsvarande).
3. Kontrollera att tjänsten är **Running** och har följande miljövariabler:
   - `ANTHROPIC_API_KEY`
   - `CORS_ORIGINS=https://kompetensradet.crosstrees.se,https://*.vercel.app`
     (lägg till Vercel-URL efter deploy)
   - `CLAUDE_MODEL=claude-sonnet-4-6`
   - `SCB_API_BASE=https://statistikdatabasen.scb.se/api/v2`
   - `JONKOPING_LAN_CODE=06`
   - Övriga (Neo4j, Qdrant, Redis) — kan vara tomma för demo;
     systemet faller tillbaka graciöst.
4. Anteckna API-URL:en (t.ex. `https://crosstrees-api.up.railway.app`).
5. Testa: `curl https://<api>/health` ska returnera 200 OK.

## Steg 2 — Importera repot i Vercel

1. På vercel.com → **Add New… → Project**.
2. Välj GitHub-repot `linneamoritznyc/crosstreeslaborintelligence`.
3. **VIKTIGT** — när Vercel frågar:
   - **Project Name:** `kompetensradet` (eller fritt)
   - **Framework Preset:** Next.js (auto-detekteras)
   - **Root Directory:** lämna som `./` — root-`vercel.json` styr resten.
4. **Environment Variables** — lägg till:
   ```
   NEXT_PUBLIC_API_URL = https://crosstrees-api.up.railway.app
   ```
   (Använd din faktiska Railway-URL.)
5. Klicka **Deploy**.
6. Vänta 2–3 minuter. Build-loggen kör `pnpm install` + `pnpm --filter=kompetensradet build`.

## Steg 3 — Verifiera deployment

Efter deploy:
1. Öppna Vercel-URL:en (t.ex. `kompetensradet-xxxx.vercel.app`).
2. Klicka **Branschanalys → Industri** → kartan ska rita 13 kommuner.
3. **ROI-kalkyl** → tryck "Beräkna ROI" → bootstrap-CI visas.
4. **AI-rådgivare** → ställ en fråga → svaret strömmar in.
5. **Exportera** → välj sektor → PDF laddas ner.

## Steg 4 — Lägg till Vercel-URL i Railway CORS

Tillbaka i Railway:
1. Uppdatera `CORS_ORIGINS` till att inkludera den exakta Vercel-URL:en.
2. Spara → Railway redeployar automatiskt (~30 s).
3. Verifiera att karta + chatt fortfarande fungerar.

## Steg 5 — Eget domännamn (frivilligt)

Vercel → Settings → Domains → lägg till `kompetensradet.crosstrees.se`.
Lägg till en CNAME `cname.vercel-dns.com` i DNS hos din registrar.

## Felsökning

| Symptom | Trolig orsak | Åtgärd |
|---|---|---|
| Build misslyckas på `pnpm install` | Saknar `pnpm-lock.yaml` | `vercel.json` använder `--no-frozen-lockfile`, ska lösas |
| Kartan visar tom yta | API svarar inte | Kontrollera Railway-status och CORS |
| "API-fel 0" i konsolen | CORS blockerar | Lägg till exakt Vercel-URL i Railway `CORS_ORIGINS` |
| AI-chatten gör inget | `ANTHROPIC_API_KEY` saknas i Railway | Lägg till och redeploy |
| ROI-knappen ger 422 | Fältvärden utanför validering | Antal 1–10 000, kostnad 0–1 000 000 |

## Demo-flödet för Kompetensrådet (3 minuter)

Förslag på live-demo:

1. **(0:00)** Öppna startsidan, peka på legaltexten i sidfoten.
2. **(0:20)** Klicka *Branschanalys → Industri*. Karta laddas.
   Hovra på Jönköping — visa befolkning + bristindex.
3. **(0:50)** *Omställning* — visa yrken med substituerbarhet > 70%.
4. **(1:20)** *ROI-kalkyl* — ändra antal till 50, kostnad 60 000.
   Klicka "Beräkna" — visa bootstrap-CI:t. Öppna antaganden.
5. **(2:00)** *AI-rådgivare* — ställ "Vilka YH-utbildningar täcker
   IT-bristen?". Visa hur svaret inleds med datakällor och avslutas
   med myndighetsförbehåll.
6. **(2:40)** *Exportera* → PDF.
7. **(3:00)** Klart.
