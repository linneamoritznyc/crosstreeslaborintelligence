# Demo Deployment Runbook

**Mål:** Få båda apparna publika inom 30 minuter.

| App | Domän (mål) | Vercel-projekt | Root Directory |
|---|---|---|---|
| Kompetensrådet | `kompetensradet.crosstrees.se` | `kompetensradet` | `apps/kompetensradet` |
| TalentFlow | `talentflow.crosstrees.se` | `talentflow` | `apps/talentflow` |

Båda fronterna pratar med **samma FastAPI-backend** på Railway.

## Steg 1 — FastAPI-backend (Railway)

1. Logga in på railway.app.
2. Öppna projektet (eller skapa ett nytt: `Deploy from GitHub repo` → välj repot
   → välj `services/matching-api` som root).
3. Sätt miljövariabler i Railway-projektet:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   CLAUDE_MODEL=claude-sonnet-4-6
   CORS_ORIGINS=https://kompetensradet.crosstrees.se,https://talentflow.crosstrees.se
   SCB_API_BASE=https://statistikdatabasen.scb.se/api/v2
   JONKOPING_LAN_CODE=06
   ALGORITHM_VERSION=pagerank_v1.0
   ```
   (Lägg till de exakta Vercel-URL:erna i `CORS_ORIGINS` efter steg 2.)
4. Verifiera: `curl https://<din-railway-url>/health` → 200 OK.
5. Anteckna API-URL:en — den ska in i båda Vercel-projektens env vars.

## Steg 2 — Vercel-projekt 1: Kompetensrådet

1. Vercel → **Add New… → Project** → välj repot.
2. **VIKTIGT — innan du klickar Deploy:**
   - **Project Name:** `kompetensradet`
   - **Framework Preset:** Next.js (auto-detekteras)
   - **Root Directory:** klicka *Edit* och välj `apps/kompetensradet`
3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = <din Railway-URL>
   ```
4. Klicka **Deploy**. Vänta 2–3 min.
5. Vercel ger dig en URL (`kompetensradet-xxxx.vercel.app`).

## Steg 3 — Vercel-projekt 2: TalentFlow

1. Tillbaka till Vercel → **Add New… → Project** → välj **samma repo** igen.
2. **VIKTIGT:**
   - **Project Name:** `talentflow`
   - **Framework Preset:** Next.js
   - **Root Directory:** välj `apps/talentflow`
3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = <din Railway-URL>     (samma som ovan)
   ```
4. Klicka **Deploy**.

## Steg 4 — Uppdatera CORS i Railway

1. Tillbaka i Railway → uppdatera `CORS_ORIGINS` till båda Vercel-URL:erna:
   ```
   CORS_ORIGINS=https://kompetensradet-xxxx.vercel.app,https://talentflow-yyyy.vercel.app
   ```
2. Railway redeployar automatiskt (~30 s).

## Steg 5 — Egna domäner (frivilligt)

För varje Vercel-projekt: **Settings → Domains** → lägg till önskad subdomän
(`kompetensradet.crosstrees.se`, `talentflow.crosstrees.se`). Lägg till
CNAME `cname.vercel-dns.com` i DNS hos din registrar. Uppdatera CORS i
Railway när domänerna är aktiva.

## Felsökning

| Symptom | Trolig orsak | Åtgärd |
|---|---|---|
| Vercel-build: `Cannot find module` | Root Directory inte satt | Settings → General → Root Directory = `apps/<app>` |
| Build misslyckas på `pnpm install` | Saknad lockfile | `vercel.json` använder `--no-frozen-lockfile`, ska lösas |
| Kartan visar tom yta | API svarar inte | Kontrollera Railway-status och CORS |
| "API-fel 0" eller CORS i konsolen | Exakt URL saknas i `CORS_ORIGINS` | Lägg till och vänta på Railway-redeploy |
| AI-chatten gör inget | `ANTHROPIC_API_KEY` saknas i Railway | Lägg till och redeploy |
| ROI-knappen ger 422 | Fältvärden utanför validering | Antal 1–10 000, kostnad 0–1 000 000 |
| 404 på `/cv/parse` (TalentFlow) | Railway-deploy körde inte `python-multipart` | Re-deploy efter `requirements.txt`-uppdatering |

## Demo-flödet för Kompetensrådet (3 minuter)

1. **(0:00)** Öppna startsidan — peka på legaltexten i footern (EU 2024/1689, Bilaga III punkt 4).
2. **(0:20)** Klicka *Branschanalys → Industri*. Kartan laddas. Hovra Jönköping — visa befolkning + bristindex.
3. **(0:50)** *Omställning* — yrken med substituerbarhet > 70%, omställningsvägar.
4. **(1:20)** *ROI-kalkyl* — ändra antal till 50, kostnad 60 000. Klicka "Beräkna" — visa bootstrap-CI. Öppna antaganden.
5. **(2:00)** *AI-rådgivare* — ställ "Vilka YH-utbildningar täcker IT-bristen?". Visa hur svaret inleds med datakällor och avslutas med myndighetsförbehåll.
6. **(2:40)** *Exportera* → PDF laddas ner.
7. **(3:00)** Klart.
