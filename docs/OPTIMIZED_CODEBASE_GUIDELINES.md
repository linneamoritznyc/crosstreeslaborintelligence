# Tekniska principer och regler

## Absoluta förbud

- Ingen hårdkodad data i UI — all data hämtas från API
- Ingen `Math.random()` — använd kryptografisk slump eller deterministiska algoritmer
- Ingen lokal dev-setup — allt driftsätts via Railway (API) och Vercel (frontend)
- Inga generiska default-värden för matchningspoäng (t.ex. "returnera 50 om okänt")

## Filstorlek

Max 200 rader per fil. Bryt ut vid behov.

## Commit-format

Conventional Commits krävs: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`

## Språk

- All PDF-export på svenska
- Alla svenska tecken måste använda å, ä, ö — aldrig "a" för "å" etc.
- UI-text på svenska för båda produkterna

## Cachestrategi

Använd namngivna TTL-konstanter från `cache.py` — aldrig magiska siffror.
Motivering dokumenteras i NEW_REPO_SPEC.md sektion 3.3.

## Felhantering

- API-fel ger aldrig falska data — returnera `None`/tom lista, aldrig fabricerade värden
- Konfidensintervall (Wilson-score) krävs för alla matchningspoäng

## Säkerhet

- Miljövariabler hanteras via Railway/Vercel dashboards — aldrig i kod
- CORS begränsas till produktiondomänerna i `CORS_ORIGINS`
- Rate limiting: 60 req/min per IP (slowapi)
