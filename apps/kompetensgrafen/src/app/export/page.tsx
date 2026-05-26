import type { Metadata } from "next";
import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import { SEKTORER } from "@/lib/sektor-data";

export const metadata: Metadata = {
  title: "Exportera PDF-rapport",
  description: "Ladda ner bristyrken, substitutabilitetsanalys och ROI-kalkyl som tjänstemannaunderlag för Kompetensrådet.",
  alternates: { canonical: "/export" },
};

const SEKTOR_LIST = Object.entries(SEKTORER).map(([id, info]) => ({ id, namn: info.namn }));

interface Props {
  searchParams: Promise<{ sektor?: string }>;
}

export default async function ExportPage({ searchParams }: Props) {
  const { sektor } = await searchParams;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          {sektor
            ? <><Link href={`/analys/${sektor}`} style={{ color: "inherit", textDecoration: "none" }}>← {SEKTORER[sektor]?.namn ?? sektor.toUpperCase()}</Link>{" · PDF-RAPPORT"}</>
            : <><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← ÖVERSIKT</Link>{" · PDF-RAPPORT"}</>
          }
        </span>
      </div>

      <h1 style={{ marginBottom: "0.5rem" }}>PDF-rapport</h1>
      <p className="tagline" style={{ fontSize: 15, marginBottom: "1rem" }}>
        Beslutsunderlag på svenska: bristyrken, substitutabilitetsanalys och ROI-kalkyl.
      </p>
      <p className="body-t" style={{ maxWidth: 520, marginBottom: "2rem" }}>
        Rapporten genereras direkt från live-data i Crosstrees design och kan delas med
        Kompetensrådet eller läggas upp i ärendesystemet.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1,
        background: "var(--border-faint)", border: "1px solid var(--border-faint)",
        maxWidth: 640, marginBottom: "2rem" }}>
        {[
          { label: "INNEHÅLL", value: "Topp-10 bristyrken, karriärövergångar, ROI-kalkyl" },
          { label: "FORMAT", value: "A4 PDF, Crosstrees designsystem, redo för utskrift" },
          { label: "KÄLLA", value: "Live-data AF Platsbanken, SCB, ESCO-taxonomin" },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "16px 20px", background: "var(--parchment)" }}>
            <p className="rust-eyebrow" style={{ marginBottom: 6 }}>{label}</p>
            <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic",
              fontSize: 13, color: "var(--ink)", margin: 0, lineHeight: 1.4 }}>{value}</p>
          </div>
        ))}
      </div>

      <form action={`${apiUrl}/kompetensgrafen/export/pdf`} method="GET">
        <p className="rust-eyebrow" style={{ marginBottom: 8 }}>VÄLJ SEKTOR</p>
        <select
          id="sektor"
          name="sektor"
          required
          defaultValue={sektor ?? ""}
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 13,
            letterSpacing: "0.06em",
            padding: "12px 16px",
            background: "var(--parchment)",
            border: "0.5px solid var(--ink)",
            color: "var(--ink)",
            width: "100%",
            maxWidth: 360,
            appearance: "auto",
            marginBottom: "1.5rem",
            display: "block",
          }}
        >
          <option value="">Välj sektor</option>
          {SEKTOR_LIST.map(s => (
            <option key={s.id} value={s.id}>{s.namn}</option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            background: "var(--ink)",
            color: "var(--parchment)",
            border: "none",
            padding: "18px 40px",
            cursor: "pointer",
          }}
        >
          Ladda ner PDF →
        </button>
      </form>

      <div style={{ marginTop: "2.5rem" }}>
        <AIActDisclaimer variant="graph" />
      </div>
    </main>
  );
}
