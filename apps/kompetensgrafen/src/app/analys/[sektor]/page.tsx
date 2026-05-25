import Link from "next/link";
import BristTabell from "@/components/BristTabell";
import LanskartaD3 from "@/components/LanskartaD3";
import AIActDisclaimer from "@/components/AIActDisclaimer";

const SEKTOR_NAMN: Record<string, string> = {
  industri: "Tillverkning & industri",
  vard: "Vård & omsorg",
  it: "IT & digitalisering",
  bygg: "Bygg & anläggning",
  logistik: "Logistik & transport",
  service: "Service & handel",
  utbildning: "Utbildning",
};

interface Props {
  params: Promise<{ sektor: string }>;
}

export default async function AnalysPage({ params }: Props) {
  const { sektor } = await params;
  const sektorNamn = SEKTOR_NAMN[sektor] ?? sektor;

  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← SEKTORVAL</Link>
          {" · "}{sektorNamn.toUpperCase()}
        </span>
      </div>
      <h1>{sektorNamn}</h1>
      <p className="coord">Bristkarta · Jönköpings läns 13 kommuner · AF Platsbanken live</p>

      <div style={{ marginTop: "1.5rem" }}>
        <LanskartaD3 sektor={sektor} />
      </div>
      <BristTabell sektor={sektor} />

      <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "0.5px solid var(--border-faint)" }}>
        <p className="sec-tag">Nästa steg</p>
        <ul className="matches" style={{ maxWidth: "500px" }}>
          <li className="m-row">
            <span className="m-name">
              <Link href="/omstallning" style={{ color: "inherit" }}>Omställningsanalys per yrke</Link>
            </span>
            <span className="m-pct">→</span>
          </li>
          <li className="m-row">
            <span className="m-name">
              <Link href={`/roi?sektor=${sektor}`} style={{ color: "inherit" }}>ROI-kalkyl för sektorn</Link>
            </span>
            <span className="m-pct">→</span>
          </li>
          <li className="m-row">
            <span className="m-name">
              <Link href={`/export?sektor=${sektor}`} style={{ color: "inherit" }}>Exportera PDF-rapport</Link>
            </span>
            <span className="m-pct">→</span>
          </li>
        </ul>
      </div>

      <AIActDisclaimer variant="graph" />
    </main>
  );
}
