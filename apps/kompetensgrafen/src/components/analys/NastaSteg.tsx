import Link from "next/link";

interface Props { sektor: string }

const STEG = [
  {
    n: "STEG 4",
    titel: "OMSTÄLLNINGSANALYS PER YRKE",
    subtitle: "Djupare analys för ett specifikt bristyrke",
    href: (s: string) => `/analys/${s}/yrken`,
  },
  {
    n: "STEG 4",
    titel: "ROI-KALKYL ANPASSAD",
    subtitle: "Justera parametrar för din regions specifika ekonomi",
    href: (s: string) => `/analys/${s}/roi`,
  },
  {
    n: "STEG 5",
    titel: "EXPORTERA PDF-RAPPORT",
    subtitle: "Hela analysen som tjänstemannarapport för Kompetensrådet",
    href: (s: string) => `/export?sektor=${s}`,
  },
];

export default function NastaSteg({ sektor }: Props) {
  return (
    <section className="analys-section" style={{ paddingTop: 48, paddingBottom: 56 }}>
      <p className="rust-eyebrow">FORTSÄTT ANALYSEN</p>
      <h2 className="analys-h2" style={{ marginBottom: 32 }}>NÄSTA STEG</h2>
      <div style={{ borderTop: "0.5px solid var(--border-faint)" }}>
        {STEG.map(s => (
          <Link key={s.titel} href={s.href(sektor)} className="nasta-row">
            <div>
              <p className="rust-eyebrow" style={{ marginBottom: 4 }}>{s.n}</p>
              <p style={{ fontFamily: "'Alumni Sans Condensed', Impact, sans-serif",
                fontWeight: 900, fontSize: 24, textTransform: "uppercase",
                color: "var(--ink)", margin: "0 0 4px", lineHeight: 1 }}>
                {s.titel}
              </p>
              <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic",
                fontSize: 14, color: "var(--muted)", margin: 0 }}>
                {s.subtitle}
              </p>
            </div>
            <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700,
              fontSize: 18, color: "var(--rust)", marginLeft: 24, flexShrink: 0 }}>
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
