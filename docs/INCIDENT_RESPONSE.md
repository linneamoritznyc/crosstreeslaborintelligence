# Incidenthantering — Crosstrees Labor Intelligence

**Rättslig grund:** EU AI-förordning 2024/1689, Artikel 73.

## Definition av allvarlig incident

En incident är **allvarlig** om något av följande inträffat:

- En användare har fattat ett felaktigt beslut baserat på felaktiga
  Crosstrees-rekommendationer som inte kunnat förutses av en rimlig
  granskning.
- Systematisk snedvridning i rekommendationer har konstaterats
  (disparate impact ratio < 0.8 enligt 80%-regeln).
- CV-innehåll eller andra personuppgifter har läckt utanför avsedd
  bearbetning.
- Systemet har fattat ett autonomt beslut som påverkat en medborgares
  tillgång till sysselsättning utan möjlighet till mänsklig granskning.

## Anmälningsplikt

Allvarliga incidenter ska anmälas till behörig svensk
marknadstillsynsmyndighet **inom 15 dagar**:

- **IMY (Integritetsskyddsmyndigheten)** för dataskyddsrelaterade incidenter
  enligt GDPR Artikel 33 (inom 72 timmar).
- **Konsumentverket** för konsumentskyddsrelaterade incidenter.
- **PTS** för incidenter rörande digital infrastruktur (vid behov).

## Eskalationskedja

1. **Tekniskt team identifierar incident** (< 2 timmar från detektering)
   - Slack-larm via `SLACK_WEBHOOK_URL`
   - Bevarande av loggar och kontext
   - Skapa GitHub-issue med `incident:`-prefix
2. **Linnea Moritz bedömer allvarlighetsgrad** (< 4 timmar)
   - Hänvisning till `RISK_REGISTER.md` för klassificering
3. **Juridisk bedömning** (< 24 timmar)
   - Avgör om anmälningsplikt föreligger enligt AI Act, GDPR eller annan
     lagstiftning
4. **Myndighetanmälan om nödvändigt** (< 15 dagar)
   - Skriftlig anmälan med:
     - Beskrivning av incidenten
     - Berörda algoritmkomponenter och versionsidentifikatorer
     - Antal påverkade individer (om kvantifierbart)
     - Vidtagna åtgärder
     - Plan för förhindrande

## Bevarande av bevis

Vid incident bevaras:
- Strukturerade loggar för relevant tidsperiod
- Algoritmversioner som var aktiva
- Eventuella benchmark- och bias-rapporter
- Användarinteraktioner (pseudonymiserade)

Minst 12 månader efter avslutad utredning, sedan radering enligt
GDPR-principen om uppgiftsminimering.

## Kontakter

| Roll | Namn | Kontakt |
|---|---|---|
| Operatör | Linnea Moritz | linnea@crosstrees.se |
| Dataskyddsombud (DPO) | (utses vid v1.0 launch) | dpo@crosstrees.se |
| Tekniskt team | Crosstrees Engineering | engineering@crosstrees.se |

## Förändringslogg

| Datum | Förändring | Ansvarig |
|---|---|---|
| 2026-05-18 | Initial version inför Kompetensrådet-demo | LM |
