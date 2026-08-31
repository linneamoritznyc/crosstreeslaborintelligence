import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakt: Crosstrees Labor Intelligence",
  description: "Kontakta Crosstrees Labor Intelligence för pilotsamarbete, frågor om Kompetensgrafen eller prisdiskussion.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← ÖVERSIKT</Link>
          {" · KONTAKT"}
        </span>
      </div>

      <h1 style={{ marginBottom: "0.5rem" }}>Kontakt</h1>
      <p className="tagline" style={{ fontSize: 15, marginBottom: "2rem" }}>
        Pilotsamarbete, prisdiskussion eller tekniska frågor.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1,
        background: "var(--border-faint)", border: "1px solid var(--border-faint)",
        maxWidth: 640, marginBottom: "2rem" }}>
        {[
          { label: "E-POST", value: "linnea@crosstrees.se", href: "mailto:linnea@crosstrees.se" },
          { label: "GRUNDARE", value: "Linnea Moritz", href: undefined },
          { label: "ORT", value: "Vetlanda, Sverige", href: undefined },
        ].map(({ label, value, href }) => (
          <div key={label} style={{ padding: "20px 24px", background: "var(--parchment)" }}>
            <p className="rust-eyebrow" style={{ marginBottom: 6 }}>{label}</p>
            {href ? (
              <a href={href} style={{ fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: 15, color: "var(--ink)" }}>{value}</a>
            ) : (
              <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: 15, color: "var(--ink)", margin: 0 }}>{value}</p>
            )}
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "'Alumni Sans Condensed', Impact, sans-serif",
        fontWeight: 900, fontSize: 28, textTransform: "uppercase", margin: "0 0 12px" }}>
        Pilotprogram
      </h2>
      <p className="body-t" style={{ maxWidth: 520, marginBottom: "1rem" }}>
        Vi söker en till två regionala pilotpartners för att validera modellen
        under 2026. Kompetensgrafen är byggd med Jönköpings län som utgångspunkt,
        men inga pilotavtal är ännu tecknade.
      </p>
      <p className="body-t" style={{ maxWidth: 520, marginBottom: "2rem" }}>
        Pilotpartners får bästa villkor och direkt inflytande över produktens riktning.
      </p>

      <Link href="/analys/vard" className="btn-main" style={{ display: "inline-flex" }}>
        Se ett exempel på analysen →
      </Link>
    </main>
  );
}
