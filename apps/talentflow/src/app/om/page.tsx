import Link from "next/link";
import AIDisclaimer from "@/components/AIDisclaimer";

export const metadata = { title: "Om TalentFlow" };

export default function OmPage() {
  return (
    <>
      <section className="card">
        <h1>Om TalentFlow</h1>
        <p style={{ fontSize: "1.0625rem", color: "var(--color-ink-soft)" }}>
          TalentFlow är ett gratis karriärverktyg från Crosstrees Labor
          Intelligence — byggt för svenska medborgare som vill förstå sin plats
          på arbetsmarknaden och hitta nästa steg.
        </p>
      </section>

      <section className="card">
        <h2>Hur det fungerar</h2>
        <ol style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          <li>
            <strong>Du laddar upp ditt CV.</strong> Vi skickar texten till
            Anthropic Claude som plockar ut yrkeskompetenser. CV:t lagras
            aldrig — varken hos oss eller hos Anthropic — efter analysen.
          </li>
          <li>
            <strong>Vi matchar mot Platsbanken.</strong> Med en TF-IDF-viktad
            Fit Score och 95% Wilson-konfidensintervall hittar vi de annonser
            din kompetensprofil verkligen ligger nära.
          </li>
          <li>
            <strong>Karriärgrafen visar närliggande yrken.</strong> Vi
            beräknar övergångar via Personalized PageRank på AF:s
            substitutabilitetsdataset.
          </li>
          <li>
            <strong>Kompetensgapet pekar på utbildningar.</strong> JobEd
            Connect kopplar saknade kompetenser till YH-kurser i din region.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>Datakällor</h2>
        <ul style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          <li>Arbetsförmedlingen — Platsbanken, taxonomi, substitutabilitetsdata, JobEd Connect</li>
          <li>SCB — lönestrukturstatistik (AM0110), yrkesregistret (AM0208)</li>
          <li>ESCO — europeisk kompetenstaxonomi</li>
          <li>Anthropic Claude — AI-modell för CV-tolkning</li>
        </ul>
      </section>

      <section className="card">
        <h2>Integritet och GDPR</h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Vi lagrar inget av ditt CV-innehåll. Sessionen sparas i en
          Redis-cache med 1 timmes TTL och raderas automatiskt. Vi loggar
          aldrig CV-text eller persondata. Anthropic behandlar din CV-text
          tillfälligt som personuppgiftsbiträde under giltigt
          DPA-avtal.
        </p>
      </section>

      <section className="card">
        <h2>EU AI Act</h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          TalentFlow är klassat som ett <strong>högrisk-AI-system</strong>{" "}
          enligt EU 2024/1689 Bilaga III punkt 4. Vi följer hela
          dokumentations- och tillsynsregimen:
        </p>
        <ul style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          <li>Teknisk dokumentation (Artikel 11) publicerad i vårt GitHub-repo</li>
          <li>Riskhanteringssystem (Artikel 9) och kvartalsvis bias-revision</li>
          <li>Transparenstext före varje CV-uppladdning (Artikel 13)</li>
          <li>Mänsklig tillsyn — du fattar alltid det slutliga beslutet (Artikel 14)</li>
          <li>Loggning av algoritmiska beslut (Artikel 12), 6 mån retention</li>
        </ul>
        <Link href="/" className="btn-link secondary" style={{ marginTop: 12 }}>
          Tillbaka till start
        </Link>
      </section>

      <AIDisclaimer variant="long" />
    </>
  );
}
