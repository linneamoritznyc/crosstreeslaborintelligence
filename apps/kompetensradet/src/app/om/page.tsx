import Link from "next/link";
import AIDisclaimer from "@/components/AIDisclaimer";

export const metadata = { title: "Om Kompetensrådet — Crosstrees" };

export default function OmPage() {
  return (
    <>
      <section className="card">
        <span className="pill">Beslutsstöd för regional kompetensförsörjning</span>
        <h1 style={{ marginTop: 12 }}>Om Kompetensrådet-verktyget</h1>
        <p style={{ fontSize: "1.0625rem", color: "var(--color-ink-soft)" }}>
          Crosstrees Kompetensrådet är ett analysverktyg som ger dataunderlag
          för strategiska beslut om YH-satsningar och omställningsinsatser i
          Jönköpings län — från mötesstart till exporterbar PDF på under tre
          minuter.
        </p>
      </section>

      <section className="card">
        <h2>Det här löser verktyget</h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Tillväxtverket konstaterar att <em>"en kvarstående utmaning är
          regionernas förutsättningar för att arbeta med analyser och
          prognoser"</em> och att <em>"analyser och prognoser är grunden för
          det regionala arbetet med kompetensförsörjning."</em>
        </p>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Crosstrees ger Kompetensrådet snabba, datadrivna svar på:
        </p>
        <ul style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          <li>Vilka bristyrken finns i varje kommun just nu?</li>
          <li>Vilken kompetensöverlapp finns mellan yrken med över- och underskott?</li>
          <li>Vilka YH-utbildningar täcker det aktuella gapet?</li>
          <li>Vad är förväntad ROI på en utbildningssatsning — med osäkerhetsintervall?</li>
        </ul>
      </section>

      <section className="card">
        <h2>Algoritmisk grund</h2>
        <ul style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          <li><strong>Bristindex per kommun</strong> — SCB AM0208 lediga jobb och vakanser, normaliserat mot befolkning.</li>
          <li><strong>Substituerbarhet</strong> — Personalized PageRank på AF substitutabilitetsdataset, dampingfaktor empiriskt bestämd.</li>
          <li><strong>Kompetensmatching</strong> — hybrid BM25 + dense embeddings via Qdrant, F0.5-tröskel benchmark-baserad.</li>
          <li><strong>ROI</strong> — bootstrap-simulering (1 000 dragningar) från MYH historiska placeringsgrader 2018–2024. Aldrig punktestimat.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Datakällor</h2>
        <ul style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          <li>Arbetsförmedlingen — Platsbanken, taxonomi, substitutabilitetsdata, JobEd Connect, historiska annonser</li>
          <li>SCB — Geodata RegSO 2025, befolkning (BE0101), AM0208 lediga jobb, AM0110 lönestrukturstatistik</li>
          <li>Myndigheten för yrkeshögskolan — årsrapporter 2018–2024 (placeringsgrader)</li>
          <li>ESCO — europeisk kompetenstaxonomi</li>
          <li>Anthropic Claude — AI-modell för rådgivarchatt</li>
        </ul>
      </section>

      <section className="card">
        <h2>EU AI Act-efterlevnad</h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Kompetensrådet-verktyget är klassat som <strong>högrisk-AI-system</strong>{" "}
          enligt EU 2024/1689 Bilaga III punkt 4. Full dokumentation finns i
          GitHub-repot:
        </p>
        <ul style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          <li>Teknisk dokumentation (Artikel 11 + Bilaga IV)</li>
          <li>Riskregister (Artikel 9)</li>
          <li>Bias-revisionsprotokoll (Artikel 9 § 7), kvartalsvis</li>
          <li>AI-chatt-transparens enligt Artikel 50 — obligatoriska inlednings- och avslutningsfraser</li>
          <li>Mänsklig tillsyn (Artikel 14) — alla beslut fattas av handläggare, aldrig automatiskt</li>
          <li>Incidenthantering (Artikel 73) — anmälningsplikt inom 15 dagar</li>
        </ul>
        <Link href="/" className="btn-link secondary" style={{ marginTop: 12 }}>
          Tillbaka till start
        </Link>
      </section>

      <AIDisclaimer variant="long" />
    </>
  );
}
