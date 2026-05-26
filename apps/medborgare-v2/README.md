# Medborgare v2 — jämförelsebygge

Den här appen är **version 2 av Crosstrees medborgarverktyg**, byggd parallellt
med `apps/talentflow/`. Båda apparna pratar med samma backend
(`services/matching-api/` på Railway) och bygger på samma data
(Arbetsförmedlingens taxonomi + ESCO + Platsbanken).

Syftet är jämförelse, inte ersättning. Två tolkningar av samma uppdrag.

## Designprinciper

Hämtade från analysen av `linneamoritznyc/antiapathyjobportal`, översatta
till Crosstrees infrastrukturella register (sjökortsestetik, lugnt,
precisionsinstrument).

| Princip | Implementation |
| --- | --- |
| Binary upload state är UX-problem | Flerstegsprogress under CV-parsning (`UppladdningInstrument`) |
| Tysta fallbacks döljer fel | Explicit `IngenMatch`-komponent med skäl och nästa steg |
| Master CV → bransch-vyer | Visa extraherade kompetenser för verifiering innan matchning (`KompetensVerifiering`) |
| `never_mention` som värdighetssystem | Lågmäld gränser-panel: "är det något du inte vill matchas mot?" |
| Match-confidence kommuniceras inte | Wilson CI synlig på *varje* matchning (`MatchKvalitet`) |
| Region-aware lokalisering | Geografi explicit i UI:t, inte gömt i backend-default |
| 80/20 — vad du kan, inte vad som saknas | Strengths-vs-gaps split-grid på yrkesvyn |
| Fallback-kedjan synlig | API-fel klassificeras (`ApiError` vs `ApiUnavailable`) och har egna copy |

## Rutter

| Sökväg | Beskrivning |
| --- | --- |
| `/` | Landing = upload-sida. Ingen marknadsföring, instrument-känsla. |
| `/granska/[session]` | Verifiera extraherade kompetenser, sätt gränser. |
| `/matchningar/[session]` | Live-matchningar med konfidensband. |
| `/yrke/[id]?session=…` | Enskilt jobb med strengths-vs-gaps. |

## Backend-tillägg

För att kunna visa användarens extraherade kompetenser (verifierings­principen)
lade jag till en additiv endpoint i `services/matching-api/src/routers/cv.py`:

```
GET /cv/session/{session_id} → { session_id, skills, skill_count }
```

Den befintliga `POST /cv/parse` returnerar fortfarande bara `{session_id, skill_count}`
för bakåtkompatibilitet med `talentflow`.

## Köra lokalt

```bash
# Backend (kräver ANTHROPIC_API_KEY, REDIS_URL)
cd services/matching-api && uvicorn src.main:app --reload --port 8000

# Frontend
cd apps/medborgare-v2
NEXT_PUBLIC_API_URL=http://localhost:8000 pnpm dev
# → http://localhost:3002
```

## Vad som ligger på Railway/Vercel

`medborgare-v2` är inte deployad än. För att deploya som separat Vercel-projekt:
peka rotmappen mot `apps/medborgare-v2/` och Vercel läser `vercel.json` i den
mappen.
