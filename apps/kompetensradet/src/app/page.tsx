import Link from "next/link";
import AIDisclaimer from "@/components/AIDisclaimer";

const SEKTORER = [
  {
    id: "industri",
    namn: "Industri och tillverkning",
    beskrivning: "Stark i Gnosjö-regionen, Värnamo och Gislaved.",
  },
  {
    id: "vard",
    namn: "Vård och omsorg",
    beskrivning: "Region Jönköpings län är största arbetsgivaren.",
  },
  {
    id: "it",
    namn: "IT och digitalisering",
    beskrivning: "Snabbväxande sektor kring Jönköping och Värnamo.",
  },
  {
    id: "bygg",
    namn: "Bygg och anläggning",
    beskrivning: "Stabil efterfrågan, pågående generationsväxling.",
  },
];

export default function StartPage() {
  return (
    <>
      <section className="card">
        <h1>Datainformerade beslut om kompetensförsörjning</h1>
        <p style={{ fontSize: "1.0625rem", color: "var(--color-ink-soft)", maxWidth: "60ch" }}>
          Beslutsstöd för Kompetensrådet i Jönköpings län. Bygger på live-data
          från Arbetsförmedlingens Platsbanken, SCB:s lönestrukturstatistik och
          ESCO-kompetenstaxonomi. Från möte till exporterbar PDF på under tre
          minuter.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <Link href="/analys/industri" className="btn-link">
            Starta branschanalys
          </Link>
          <Link href="/chatt" className="btn-link secondary">
            Fråga AI-rådgivaren
          </Link>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Välj bransch att analysera</h2>
          <span className="pill">Steg 1 av 5</span>
        </div>
        <div className="grid grid-2">
          {SEKTORER.map((s) => (
            <Link
              key={s.id}
              href={`/analys/${s.id}`}
              style={{
                display: "block",
                padding: "var(--space-md)",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border-soft)",
                borderRadius: "var(--radius-md)",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <strong style={{ display: "block", marginBottom: 4 }}>{s.namn}</strong>
              <span style={{ fontSize: "0.875rem", color: "var(--color-ink-muted)" }}>
                {s.beskrivning}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Mötesflödet — fem steg</h2>
        <ol style={{ paddingLeft: 24, color: "var(--color-ink-soft)" }}>
          <li><strong>Branschanalys</strong> — kommunkartan visar bristindex och live-annonser per kommun.</li>
          <li><strong>Omställning</strong> — yrken med hög substituerbarhet identifieras automatiskt.</li>
          <li><strong>Utbildningsgap</strong> — JobEd Connect kopplar gap till YH-kurser.</li>
          <li><strong>ROI-kalkyl</strong> — bootstrap-baserade konfidensintervall, alla antaganden synliga.</li>
          <li><strong>Export</strong> — komplett rapport som PDF på svenska, klar för delning.</li>
        </ol>
      </section>

      <AIDisclaimer variant="long" />
    </>
  );
}
