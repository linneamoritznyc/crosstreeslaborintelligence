import Link from "next/link";

interface Props {
  sektor: string;
  sektorNamn: string;
}

export default function PDFExportBlock({ sektor, sektorNamn }: Props) {
  return (
    <section style={{
      padding: "56px 40px",
      background: "#060710",
      color: "#DDE2F2",
      borderTop: "0.5px solid rgba(0,207,255,0.18)",
    }}>
      <p style={{
        fontFamily: "'Courier Prime', monospace",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(0,207,255,0.55)",
        margin: "0 0 16px",
        textShadow: "0 0 14px rgba(0,207,255,0.3)",
      }}>
        STEG 4 · EXPORTERA BESLUTSUNDERLAG
      </p>
      <h2 style={{
        fontFamily: "'Alumni Sans Condensed', Impact, sans-serif",
        fontWeight: 900,
        fontSize: 40,
        textTransform: "uppercase",
        color: "#DDE2F2",
        lineHeight: 0.95,
        margin: "0 0 16px",
      }}>
        PDF-RAPPORT
      </h2>
      <p style={{
        fontFamily: "'IM Fell English', 'Libre Baskerville', Georgia, serif",
        fontStyle: "italic",
        fontSize: 18,
        color: "rgba(221,226,242,0.65)",
        maxWidth: 560,
        margin: "0 0 36px",
        lineHeight: 1.5,
      }}>
        Hela analysen för {sektorNamn} formaterad som tjänstemannaunderlag.
        Klar att lägga fram på Kompetensrådets nästa möte.
      </p>
      <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
        <Link
          href={`/export?sektor=${sektor}`}
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            background: "#00CFFF",
            color: "#060710",
            border: "0.5px solid #00CFFF",
            padding: "18px 40px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            boxShadow: "0 0 20px rgba(0,207,255,0.3)",
          }}
        >
          Exportera PDF-rapport →
        </Link>
        <Link
          href="/chatt"
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            background: "transparent",
            color: "rgba(221,226,242,0.6)",
            border: "0.5px solid rgba(0,207,255,0.22)",
            borderLeft: "none",
            padding: "18px 28px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Fråga AI-rådgivaren
        </Link>
      </div>
      <p style={{
        fontFamily: "'Courier Prime', monospace",
        fontSize: "0.72rem",
        color: "rgba(221,226,242,0.22)",
        letterSpacing: "0.04em",
        marginTop: 24,
        marginBottom: 0,
      }}>
        BRISTYRKEN · SUBSTITUERBARHET · ROI-KALKYL · IFAU/OECD-METOD · {sektorNamn.toUpperCase()}
      </p>
    </section>
  );
}
