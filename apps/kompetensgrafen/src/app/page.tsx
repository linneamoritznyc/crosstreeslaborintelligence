import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";

const SEKTORER = [
  { id: "industri", namn: "Tillverkning & industri", beskrivning: "Maskinoperatörer · svetsare · automationstekniker · vindkrafttekniker" },
  { id: "vard", namn: "Vård & omsorg", beskrivning: "Undersköterskor · sjuksköterskor · personliga assistenter" },
  { id: "it", namn: "IT & digitalisering", beskrivning: "Mjukvaruutvecklare · systemarkitekter · dataingenjörer" },
  { id: "bygg", namn: "Bygg & anläggning", beskrivning: "Elektriker · snickare · anläggningsarbetare" },
  { id: "logistik", namn: "Logistik & transport", beskrivning: "Truckförare · lastbilsförare · lagerarbetare" },
  { id: "service", namn: "Service & handel", beskrivning: "Butikschefer · kockar · restaurangchefer" },
  { id: "utbildning", namn: "Utbildning", beskrivning: "Lärare i grundskolan · förskollärare" },
];

export default function StartPage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-texture" />
        <svg
          className="hero-contours"
          viewBox="0 0 680 420"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M-40 100 Q 200 70 400 120 T 720 90" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 160 Q 180 130 380 180 T 720 150" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 220 Q 220 190 420 240 T 720 210" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 280 Q 200 250 400 300 T 720 270" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 340 Q 240 310 440 360 T 720 330" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <text x="430" y="115" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 51 m</text>
          <text x="430" y="175" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 42 m</text>
          <text x="430" y="235" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 33 m</text>
          <text x="430" y="295" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 24 m</text>
        </svg>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Jönköpings Kompetensråd · Regional analys</span>
          </div>
          <div className="h1">
            Kompetens<span className="accent">-</span>
            <br />
            försörjning
          </div>
          <p className="tagline">
            Från frågeställning till exporterad PDF-rapport på under tre minuter.
            Live-data från AF Platsbanken, SCB och Neo4j-grafen.
          </p>
          <div className="cta-row">
            <Link href="/analys/industri" className="btn-main">
              Välj bransch →
            </Link>
            <Link href="/chatt" className="btn-ghost">
              AI-rådgivare
            </Link>
          </div>
        </div>
      </section>

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
          <div className="band-label">Rapport</div>
          <div className="band-val">&lt;3 min</div>
          <div className="band-note">Frågeställning till PDF-export</div>
        </div>
      </div>

      <div className="split">
        <div className="split-left">
          <div className="rope-band" />
          <div className="sec-tag">Steg 1 · Välj bransch</div>
          <h2 className="sec-head">Bristkarta per sektor — länets 13 kommuner.</h2>
          <p className="body-t">
            Live-data från Arbetsförmedlingens Platsbanken. Välj en sektor för att
            se bristyrken, substitutabilitet och utbildningsgap.
          </p>
          <ul className="matches">
            {SEKTORER.map((s) => (
              <li className="m-row" key={s.id}>
                <span className="m-name">
                  <Link href={`/analys/${s.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {s.namn}
                  </Link>
                </span>
                <Link href={`/analys/${s.id}`} className="m-pct" style={{ textDecoration: "none" }}>
                  →
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="split-right">
          <div className="sec-tag">Steg 2 · Djupanalys</div>
          <h2 className="sec-head">Omställning, ROI och AI-rådgivare.</h2>
          <p className="body-t">
            Kompetensöverlapp mellan yrken, bootstrap-konfidensintervall för
            utbildningsinsatser, och fritextfrågor om regionens arbetsmarknad.
          </p>
          <ul className="matches">
            <li className="m-row">
              <span className="m-name">
                <Link href="/omstallning" style={{ color: "inherit" }}>Omställningsanalys</Link>
              </span>
              <span className="m-pct" style={{ fontSize: "11px" }}>Kompetensöverlapp</span>
            </li>
            <li className="m-row">
              <span className="m-name">
                <Link href="/roi" style={{ color: "inherit" }}>ROI-kalkylator</Link>
              </span>
              <span className="m-pct" style={{ fontSize: "11px" }}>95% KI</span>
            </li>
            <li className="m-row">
              <span className="m-name">
                <Link href="/chatt" style={{ color: "inherit" }}>AI-rådgivare</Link>
              </span>
              <span className="m-pct" style={{ fontSize: "11px" }}>RAG · Neo4j</span>
            </li>
            <li className="m-row">
              <span className="m-name">
                <Link href="/export" style={{ color: "inherit" }}>PDF-rapport</Link>
              </span>
              <span className="m-pct" style={{ fontSize: "11px" }}>Beslutsunderlag</span>
            </li>
          </ul>
          <div style={{ marginTop: "2rem" }}>
            <AIActDisclaimer variant="chat" />
          </div>
        </div>
      </div>
    </main>
  );
}
