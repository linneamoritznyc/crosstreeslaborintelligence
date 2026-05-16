# Komplett byggritning — Crosstrees Labor Intelligence

## 1. Produktöversikt

Två separata Next.js-applikationer med gemensam FastAPI-backend:

- **TalentFlow** (`talentflow.crosstrees.se`): CV-uppladdning, jobbmatchning, karriärplanering för medborgare
- **Kompetensrådet** (`kompetensradet.crosstrees.se`): Regional arbetsmarknadsanalys för Jönköpings läns kompetensråd

## 2. Teknisk stack

| Lager | Teknik | Driftsättning |
|---|---|---|
| Frontend | Next.js 15 App Router | Vercel |
| Backend | FastAPI + Python 3.11 | Railway |
| Graf | Neo4j AuraDB | Neo4j Cloud (EU) |
| Vektorer | Qdrant | Qdrant Cloud (EU) |
| Cache | Redis | Railway plugin |
| AI | Anthropic Claude | API |

## 3. Arkitekturella beslut

### 3.1 Matchningsalgoritm
Viktad TF-IDF med Wilson score-konfidensintervall (95%). Inga default-poäng.

### 3.2 Grafdatabas
Neo4j för karriärgrafer med SUBSTITUTABLE_BY- och ADJACENT_TO-relationer.
PageRank beräknas i pipelines, inte vid request-tid.

### 3.3 Cache-TTL-motiveringar
- Jobbannonser: 15 min (Platsbanken uppdateras kontinuerligt)
- Yrkesöversikter: 4 h (lägre förändringstakt)
- Taxonomi/embeddings: 7 dagar (pipeline-styrt schema)
- CV-sessioner: 1 h (temporär data, GDPR)
- AI Act-loggar: 6 månader (Artikel 12-krav)

## 4. Dataskydd

- Inga personuppgifter lagras permanent
- CV-data raderas efter 1 h (TTL i Redis)
- GDPR-artikel 17 (rätt till radering) möjliggörs via session-ID
