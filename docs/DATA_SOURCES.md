# Datakällor

## Arbetsförmedlingen (jobtechdev.se)

| API | Användning | Licens |
|---|---|---|
| Jobsearch | Realtidsannonser, matchning | Öppen utan krav |
| Taxonomy | Yrkes- och kompetenstaxa | Öppen utan krav |
| Enrichments | Extraktion av kompetenser ur annonstext | Öppen utan krav |
| Jobed Connect | Utbildningsrekommendationer | Öppen utan krav |
| Historical | Historisk annonsvolym för IDF | Öppen utan krav |

## SCB (statistikdatabasen.scb.se)

| Dataset | Användning | Licens |
|---|---|---|
| AM0208 | Bristyrken per bransch och län | CC0 |
| Lönestatistik | ROI-beräkningar | CC0 |

## Uppdateringsschema

- **Dagligen**: Jobbannonser (cron 04:00)
- **Veckovis måndag**: Taxonomi (cron 03:00)
- **Veckovis tisdag**: Trender (cron 05:00)
- **Kvartalsvis**: Biasrevision (cron 06:00 den 1:a jan/apr/jul/okt)
