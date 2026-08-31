# Grafmatematik: byggt, specificerat, forskningsriktning

Detta dokument håller isär tre nivåer som annars lätt blandas ihop i
presentationer och ansökningar:

1. **Byggt och kört** — finns i den körande produkten just nu.
2. **Specificerat men ej kört** — kod finns, men anropas inte i produktionsvägen.
3. **Forskningsriktning** — inte påbörjat, dokumenterat som riktning.

Regeln: en läsare ska alltid kunna avgöra vilken nivå ett påstående tillhör.
Ingen siffra eller algoritm får flyttas uppåt en nivå i marknadsföringstext.

---

## Nivå 1 — Byggt och kört

| Vad | Var | Anmärkning |
|---|---|---|
| Substituerbarhetsgraf i Neo4j | `seeder.py` → `SUBSTITUTABLE_BY` | 22 yrken, 51 kompetenser, 38 riktade kanter (19 par, dubbelriktade) |
| Poängsättning 25 / 50 / 75 | `transform/substitutability.py` | Mappning från AF:s `substitutability_level` 1–3. Tre nivåer behålls; inget linjärt brus uppfinns |
| Kollaps till yrkespar + riktningar | `natverk_service.py` | `can_become` / `can_replace` bevaras |
| Kortaste omställningsväg | `lib/natverk-vag.ts` | Dijkstra med kantkostnad `100 − score`, dvs. vägen med minst sammanlagd omlärning |
| Kraftbaserad layout | `Kompetensnatverk/index.tsx` | d3-force; länkavstånd skalar med överlappets styrka |

**Detta är hela grafmatematiken i produkten i dag.** Ingen centralitets-,
community- eller embedding-algoritm körs i någon produktionsväg.

## Nivå 2 — Specificerat men ej kört

| Vad | Var | Varför den inte körs |
|---|---|---|
| Jaccard-likhet mellan yrkespar | `build_substitutability_matrix()` | Anropas endast från `tests/test_pipeline.py`. Pipelinen använder AF:s nivåer, inte Jaccard. **Grafen är alltså inte Jaccard-baserad.** |
| PageRank | `evaluate/pagerank_sensitivity.py` | `compute_pagerank` anropas endast från enhetstester. Ingår inte i `pipeline.py` |
| Louvain-communities | `neo4j_loader.run_louvain_clustering()` | Anropas i `pipeline.py`, men kräver Neo4j GDS (AuraDB Professional) och är inlindad i try/except. Pipelinen har aldrig kört igenom, så den har aldrig exekverats |
| Vektorembeddings i Qdrant | `load/qdrant_loader.py` | Del av pipelinen, som aldrig kört igenom |

**Node2Vec finns inte i kodbasen.** Om det nämns någonstans som "specificerat"
är det felaktigt — det tillhör nivå 3.

Gemensam blockerare för hela nivå 2: `taxonomy-sync.yml` har failat samtliga
körningar sedan 2026-05-18 eftersom `NEO4J_*`-secrets är tomma. Full
ESCO-laddning och allt som bygger på den förutsätter att de sätts.

## Nivå 3 — Forskningsriktning

Inte påbörjat. Dokumenterat för att visa riktning, inte för att antyda
byggbarhet på kort sikt.

### 3.1 Temporala kunskapsgrafer för kompetensprognos

I stället för en statisk ögonblicksbild: tidsstämpla kanterna och formulera
prognosen som *temporal link prediction* — vilka kopplingar mellan yrke och
kompetens som sannolikt stärks eller uppstår framöver.

Referens: Fettach, Bahaj & Ghogho, *Skill Demand Forecasting Using Temporal
Knowledge Graph Embeddings*, arXiv:2504.07233 (april 2025).
Bygger en temporal graf, **JobEdKG**, från jobbannonser (Rekrute.com) och MOOC:ar
(Coursera), med regelbaserad kompetensextraktion mot Jobzilla, ESCO och ROME.
Utvärderingen gäller IT-yrken.

Att notera vid citering: detta är en **marockansk** datamängd inom IT, inte en
nordisk arbetsmarknadsstudie. Metoden är överförbar; resultaten är det inte
utan egen validering mot svensk data.

### 3.2 Grafnätverk för automationsrisk per yrke

Lägg ett graph convolutional network över yrke–kompetens-grafen och skatta
automationsrisk per yrke, som en andra signal vid sidan av överlappet: inte bara
"vilka yrken ligger nära" utan "hur hållbart är yrket".

Referens: Xu, Yang, Rizoiu & Xu, *Being Automated or Not? Risk Identification of
Occupations with Graph Neural Networks*, arXiv:2209.02182 (AOC-GCN).
Klassificerar 910 yrken enligt SOC utifrån arbetsuppgifter, kompetenser och
interaktioner.

Att notera vid citering: SOC är den amerikanska yrkesklassifikationen. En svensk
tillämpning kräver mappning mot SSYK och egen träningsdata.

### 3.3 Självuppdaterande graf

Den mest ambitiösa riktningen: låt grafstrukturen utvecklas kontinuerligt från
verkliga arbetsmarknadssignaler i stället för periodiska statiska exporter, med
ett återkopplingslager som optimerar rekommendationerna mot faktiskt lyckade
omställningar.

Detta är ett fleråriga forsknings- och utvecklingsarbete. Vi känner inte till
någon publicerad studie som visar detta i produktion på en regional
arbetsmarknad, och siffror om effektstorlek ska inte anges för den här punkten.

---

## Citeringsregler för ansökningar och presentationer

- Nivå 3 får aldrig beskrivas i presens. Skriv "skulle kunna", inte "gör".
- Ange alltid primärkällan. För Googles Knowledge Graph: Googles egen
  annonsering, *Introducing the Knowledge Graph: things, not strings*
  (16 maj 2012, 500 miljoner objekt och 3,5 miljarder fakta vid lansering) —
  inte en SEO-byrås sammanfattning.
- Blogginlägg är inte forskning. Om ett påstående behöver stöd, använd de
  peer-reviewade referenserna ovan.
- Siffror från ett papper får inte återanvändas som om de gällde Kompetensgrafen.
