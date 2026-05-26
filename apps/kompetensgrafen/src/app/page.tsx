import type { Metadata } from "next";
import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import HeroNet from "@/components/HeroNet";

export const metadata: Metadata = {
  title: "Kompetensgrafen — Regional arbetsmarknadsanalys Jönköpings län",
  description:
    "Komplement till SKR:s demografiverktyg och regionala kompetensplaner. Kopplar bristdata till " +
    "substituerbarhet mellan yrken och beräknar ROI per omställning. Live-data från AF Platsbanken och ESCO. " +
    "Byggd för Kompetensrådet Region Jönköping.",
  alternates: { canonical: "/" },
};

const SEKTORER = [
  { id: "industri", namn: "Tillverkning & industri", yrken: "Svetsare · maskinoperatörer · automationstekniker" },
  { id: "vard",     namn: "Vård & omsorg",           yrken: "Undersköterskor · sjuksköterskor · personliga assistenter" },
  { id: "it",       namn: "IT & digitalisering",     yrken: "Mjukvaruutvecklare · systemarkitekter · dataingenjörer" },
  { id: "bygg",     namn: "Bygg & anläggning",       yrken: "Elektriker · snickare · anläggningsarbetare" },
  { id: "logistik", namn: "Logistik & transport",    yrken: "Truckförare · lastbilsförare · lagerarbetare" },
  { id: "service",  namn: "Service & handel",        yrken: "Butikschefer · kockar · restaurangchefer" },
  { id: "utbildning", namn: "Utbildning",            yrken: "Lärare · förskollärare" },
];

export default function StartPage() {
  return (
    <main>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-texture" />
        <svg className="hero-contours" viewBox="0 0 680 420"
          preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M-40 80 Q 180 55 400 100 T 720 75"   fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 140 Q 160 115 380 160 T 720 135" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 200 Q 200 175 420 220 T 720 195" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 260 Q 180 235 400 280 T 720 255" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 320 Q 220 295 440 340 T 720 315" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
        </svg>
        <HeroNet />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Jönköpings Kompetensråd · Regional arbetsmarknadsanalys</span>
          </div>
          <div className="h1">
            Kompetens<span className="accent">-</span>
            <br />
            grafen
          </div>
          <p className="tagline">
            SKR visar var bristen finns. AF visar prognoser. Det som saknas är
            kopplingen till substituerbarhet och ROI — vem kan faktiskt ställas om, och vad kostar det?
          </p>
          <div className="cta-row">
            <Link href="#sektorer" className="btn-main">
              Börja här →
            </Link>
            <Link href="/chatt" className="btn-ghost">
              Fråga AI-rådgivaren
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — 3 steps ────────────────────────────── */}
      <div className="steps-band">
        <div className="step-item">
          <span className="step-num">1</span>
          <span className="step-label">Välj din sektor</span>
        </div>
        <div className="step-arrow">→</div>
        <div className="step-item">
          <span className="step-num">2</span>
          <span className="step-label">Se bristkartan</span>
        </div>
        <div className="step-arrow">→</div>
        <div className="step-item">
          <span className="step-num">3</span>
          <span className="step-label">Exportera rapport</span>
        </div>
      </div>

      {/* ── SECTOR TILES ──────────────────────────────────────── */}
      <section className="sector-section" id="sektorer">
        <div className="sector-intro">
          <p className="rust-eyebrow">STEG 1 · VÄLJ DIN SEKTOR</p>
          <h2 className="sec-head" style={{ margin: 0 }}>
            Vilken sektor jobbar du med?
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
              <span className="sector-card-cta">Öppna analysen →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── POSITIONING — what Crosstrees adds ───────────────── */}
      <div className="position-band">
        <p className="position-label">VAD KOMPETENSGRAFEN TILLFÖR</p>
        <p className="position-text">
          SKR:s demografiverktyg visar att antalet 80-åringar ökar. AF:s Yrkesbarometer visar
          att det behövs fler undersköterskor. Kompetensgrafen svarar på nästa fråga:{" "}
          <em>vilka yrkesgrupper kan faktiskt ställas om dit, baserat på faktiskt kompetensöverlapp —
          och vad kostar och sparar det per person?</em>
        </p>
      </div>

      {/* ── WHAT YOU GET — 3 capability cards ────────────────── */}
      <section className="cap-section">
        <div className="cap-grid">
          <div className="cap-card">
            <span className="cap-num">01</span>
            <h3 className="cap-title">Bristkarta</h3>
            <p className="cap-q">I vilken kommun är bristen hårdast?</p>
            <p className="cap-desc">
              Realtidsdata från AF Platsbanken, uppdelad per yrke och kommun.
              Komplement till SKR:s demografiöversikt — operativt och uppdaterat dagligen.
            </p>
            <Link href="/analys/vard" className="cap-link">Se ett exempel →</Link>
          </div>
          <div className="cap-card">
            <span className="cap-num">02</span>
            <h3 className="cap-title">Substituerbarhet</h3>
            <p className="cap-q">Vilka yrken kan faktiskt ställas om till bristyrken?</p>
            <p className="cap-desc">
              Baserat på ESCO-taxonomins kompetensöverlapp — inte antaganden.
              Det här är det lager som saknas i regionala kompetensplaner och AF:s prognoser.
            </p>
            <Link href="/omstallning" className="cap-link">Se karriärvägar →</Link>
          </div>
          <div className="cap-card">
            <span className="cap-num">03</span>
            <h3 className="cap-title">ROI & PDF</h3>
            <p className="cap-q">Vad kostar omställningen — och vad sparar den regionen?</p>
            <p className="cap-desc">
              IFAU/OECD Cost-Benefit-metod. Interaktiv slider per antal omställningar.
              Exportera beslutsunderlag direkt till Kompetensrådets nästa möte.
            </p>
            <Link href="/roi" className="cap-link">Beräkna ROI →</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <div className="band">
        <div className="band-cell">
          <div className="band-label">Kommuner</div>
          <div className="band-val">13</div>
          <div className="band-note">Jönköpings läns alla kommuner</div>
        </div>
        <div className="band-cell">
          <div className="band-label">Datakällor</div>
          <div className="band-val">4</div>
          <div className="band-note">AF · SCB · ESCO · Neo4j</div>
        </div>
        <div className="band-cell">
          <div className="band-label">Tid till PDF</div>
          <div className="band-val">&lt;3 min</div>
          <div className="band-note">Från frågeställning till beslutsunderlag</div>
        </div>
      </div>

      <div style={{ padding: "24px 40px", background: "var(--parchment-dark)",
        borderTop: "0.5px solid var(--border-faint)" }}>
        <AIActDisclaimer variant="chat" />
      </div>
    </main>
  );
}
