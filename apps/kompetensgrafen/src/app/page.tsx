import type { Metadata } from "next";
import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import HeroNet from "@/components/HeroNet";

export const metadata: Metadata = {
  title: "Kompetensgrafen: Sorteringssystemet för arbetsmarknaden",
  description:
    "Visar var det saknas personal i Jönköpings 13 kommuner, vilka yrkesgrupper som kan gå dit " +
    "baserat på kompetensöverlapp, och vad en omställning kostar och sparar. Byggt för Kompetensrådet Region Jönköping.",
  alternates: { canonical: "/" },
};

const SEKTORER = [
  { id: "vard",       namn: "Vård & omsorg",           yrken: "Undersköterskor · sjuksköterskor · personliga assistenter", roi: 301 },
  { id: "industri",   namn: "Tillverkning & industri", yrken: "Svetsare · maskinoperatörer · automationstekniker", roi: 314 },
  { id: "it",         namn: "IT & digitalisering",     yrken: "Mjukvaruutvecklare · systemarkitekter · dataingenjörer", roi: 367 },
  { id: "bygg",       namn: "Bygg & anläggning",       yrken: "Elektriker · snickare · anläggningsarbetare", roi: 315 },
  { id: "logistik",   namn: "Logistik & transport",    yrken: "Truckförare · lastbilsförare · lagerarbetare", roi: 329 },
  { id: "service",    namn: "Service & handel",        yrken: "Butikschefer · kockar · restaurangchefer", roi: 248 },
  { id: "utbildning", namn: "Utbildning",              yrken: "Lärare · förskollärare", roi: 268 },
];

export default function StartPage() {
  return (
    <main>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-texture" />
        <HeroNet />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Kompetensrådet Region Jönköping</span>
          </div>
          <div className="h1">
            Kompetens<span className="accent">-</span>
            <br />
            grafen
          </div>
          <p className="tagline">
            Sorteringssystemet för arbetsmarknaden.
            Vi matchar kompetens med bristyrken, utifrån vad folk redan kan.
          </p>
          <div className="cta-row">
            <Link href="#sektorer" className="btn-main">
              Välj sektor och starta →
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHAT THIS IS — 3 plain-language items ─────────────── */}
      <section style={{
        padding: "48px 40px",
        background: "var(--parchment-dark)",
        borderBottom: "0.5px solid var(--border-faint)",
      }}>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700,
          fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--rust)", margin: "0 0 24px" }}>
          DET HÄR VERKTYGET VISAR TRE SAKER
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2,
          background: "var(--border-faint)", border: "1px solid var(--border-faint)" }}>
          {[
            { num: "1", titel: "Var saknas det personal?", text: "En karta över Jönköpings alla 13 kommuner. Mörkare färg = större brist. Klicka på en sektor och se vilka kommuner som har det svårast." },
            { num: "2", titel: "Vem kan gå dit?", text: "Vi jämför yrkenas kunskaper med varandra. En elektriker och en automationstekniker delar 71 % av sina kunskaper. Det är den matchningen myndigheterna inte gör idag." },
            { num: "3", titel: "Vad kostar det och vad sparar det?", text: "En omställning kostar ungefär 185 000 kr. Regionen sparar 742 000 kr per person i minskad a-kassa och ökade skatteintäkter. ROI: 301 %." },
          ].map(item => (
            <div key={item.num} style={{ padding: "36px 32px", background: "var(--parchment)" }}>
              <div style={{ fontFamily: "'Alumni Sans Condensed', Impact, sans-serif",
                fontWeight: 900, fontSize: 56, color: "var(--rust)", lineHeight: 1,
                opacity: 0.2, marginBottom: 8 }}>{item.num}</div>
              <h3 style={{ fontFamily: "'Alumni Sans Condensed', Impact, sans-serif",
                fontWeight: 900, fontSize: 26, textTransform: "uppercase", color: "var(--ink)",
                margin: "0 0 12px", lineHeight: 1.1 }}>{item.titel}</h3>
              <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: 16, lineHeight: 1.7, color: "var(--ink-soft)", margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTOR TILES ──────────────────────────────────────── */}
      <section className="sector-section" id="sektorer">
        <div className="sector-intro">
          <p className="rust-eyebrow">VÄLJ DIN SEKTOR</p>
          <h2 className="sec-head" style={{ margin: 0, fontSize: 28 }}>
            Välj en sektor för att se analysen.
          </h2>
        </div>
        <div className="sector-grid">
          {SEKTORER.map((s, i) => (
            <Link
              key={s.id}
              href={`/analys/${s.id}`}
              className="sector-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="sector-card-name">{s.namn}</span>
              <span className="sector-card-yrken">{s.yrken}</span>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <span className="sector-card-cta">Öppna analysen →</span>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700,
                  fontSize: 13, color: "var(--rust)", letterSpacing: "0.08em" }}>
                  ROI {s.roi}%
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <div className="band">
        <div className="band-cell">
          <div className="band-label">Kommuner</div>
          <div className="band-val">13</div>
          <div className="band-note">Alla kommuner i Jönköpings län</div>
        </div>
        <div className="band-cell">
          <div className="band-label">Datakällor</div>
          <div className="band-val">4</div>
          <div className="band-note">AF · SCB · ESCO · Neo4j</div>
        </div>
        <div className="band-cell">
          <div className="band-label">Från fråga till PDF</div>
          <div className="band-val">&lt;3 min</div>
          <div className="band-note">Klart att läggas fram på rådets nästa möte</div>
        </div>
      </div>

      <div style={{ padding: "24px 40px", background: "var(--parchment-dark)",
        borderTop: "0.5px solid var(--border-faint)" }}>
        <AIActDisclaimer variant="chat" />
      </div>
    </main>
  );
}
