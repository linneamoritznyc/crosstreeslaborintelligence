// llms.txt — machine-readable site guide for LLMs and automated crawlers.
// Convention described at https://llmstxt.org
import { getSiteUrl } from "@/lib/site-url";

const BASE_PLACEHOLDER = "{BASE_URL}";

const CONTENT = `# Kompetensgrafen — Jönköpings Kompetensråd

> Regional arbetsmarknadsanalys för Jönköpings läns 13 kommuner.
> Verktyg för kompetensstyrning och omställningsplanering, byggt för
> Kompetensrådet Region Jönköping.

## Syfte

Kompetensgrafen är ett operativt komplement till befintliga strategiska verktyg
(SKR:s demografivisualisering, regionala kompetensplaner, AF:s Yrkesbarometer).
Befintliga verktyg visar var kompetensbristen finns och hur befolkningen utvecklas.
Kompetensgrafen kopplar den informationen till substituerbarhet mellan yrken —
vilka yrkesgrupper kan faktiskt ställas om till bristyrken, baserat på faktiskt
kompetensöverlapp i ESCO-taxonomin — och beräknar ROI per omställning med
Cost-Benefit Analysis-metoden från IFAU och OECD.

## Datakällor

- AF Platsbanken — live jobbannonser per yrke och kommun (AF JobTech Dev API)
- Neo4j-graf — ESCO substitutabilitetsdata (22 yrken, 51 kompetenser, 38 SUBSTITUTABLE_BY-kanter)
- SCB Geodata — kommuncentroider, Jönköpings läns 13 kommuner
- SCB Yrkesregistret — sysselsättningsstatistik per sektor [placeholder — TODO: live SCB API]
- AF Yrkesbarometern — bristindex per sektor [placeholder — TODO: live]

## Sidor

- / — Startsida: sektoröversikt, transferabilitetsgrafen för 13 kommuner, statistikband
- /analys/{sektor} — Sektorsanalys (5 steg):
    Steg 1: Bristkarta (D3 Voronoi choropleth, 13 kommuner, rust-intensitet = brist)
    Steg 2: Topp-10 bristyrken (rankade efter AF-annonsvolym)
    Steg 3: Karriärövergångar (animerad graf, ESCO-substitutabilitet)
    Steg 4: ROI-kalkyl (IFAU/OECD CBA-metod, live slider)
    Steg 5: Nästa steg → yrken, ROI, PDF-export
- /omstallning — Omställningsanalys: vilka yrken kan substituera ett bristyrke?
- /roi — ROI-kalkylator: kostnad vs besparing per omställd person
- /chatt — AI-rådgivare (RAG-baserad, Claude + Qdrant vektorsök)
- /export — PDF-rapport för beslutsfattare (Kompetensrådet)

## Sektorer (används i /analys/{sektor})

- industri — Tillverkning & industri (SSYK: 31, 72, 81, 82, 74)
- vard — Vård & omsorg (SSYK: 22, 53, 32)
- it — IT & digitalisering (SSYK: 25, 35)
- bygg — Bygg & anläggning (SSYK: 71, 75)
- logistik — Logistik & transport (SSYK: 43, 83, 93)
- service — Service & handel (SSYK: 14, 51, 52)
- utbildning — Utbildning (SSYK: 23)

## Backend-API (öppet för läsning)

Bas-URL: {API_URL}

Kompetensgrafen-endpoints:
- GET /kompetensgrafen/brist?sektor={slug} — bristyrken med AF-annonsvolym
- GET /kompetensgrafen/karta?sektor={slug} — kommundata (lon, lat, brist_index)
- GET /kompetensgrafen/sector-stats?sektor={slug} — sysselsättning, bristtal, prognos
- GET /kompetensgrafen/top-shortage-occupations?sektor={slug} — topp-10 bristyrken
- GET /kompetensgrafen/omstallning?target={occupation_id} — substitutabilitetsanalys
- GET /kompetensgrafen/yrken?sektor={slug} — alla yrken i sektorn
- GET /kompetensgrafen/roi?antal_deltagare=N&utbildningskostnad_kr=K&sektor={slug} — ROI
- GET /kompetensgrafen/export/pdf?sektor={slug} — PDF-rapport (application/pdf)
- GET /health — hälsokontroll

## Kommuner (Jönköpings län, 13 st)

Jönköping (0680), Nässjö (0682), Värnamo (0683), Sävsjö (0684), Vetlanda (0685),
Eksjö (0686), Aneby (0604), Gnosjö (0617), Mullsjö (0642), Habo (0643),
Gislaved (0662), Vaggeryd (0665), Tranås (0687)

## AI Act-förbehåll

Karriärövergångar och matchningsrekommendationer är AI-genererade baserat på
Arbetsförmedlingens substitutabilitetsdata. Beslut fattas av behöriga handläggare.

## Kontakt

Crosstrees Labor Intelligence · Vetlanda, Sverige · crosstrees.se
`;

export function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.crosstrees.se";
  const body = CONTENT
    .replaceAll(BASE_PLACEHOLDER, getSiteUrl())
    .replaceAll("{API_URL}", apiUrl);
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
