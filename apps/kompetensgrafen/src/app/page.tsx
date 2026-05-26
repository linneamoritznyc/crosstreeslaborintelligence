import type { Metadata } from "next";
import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import RegionCanvas from "@/components/RegionCanvas";
import HeroNet from "@/components/HeroNet";

export const metadata: Metadata = {
  title: "Kompetensgrafen — Regional arbetsmarknadsanalys Jönköpings län",
  description:
    "Bristkartor, omställningsanalys och ROI-kalkyl för Jönköpings läns 13 kommuner och 7 sektorer. " +
    "Live-data från AF Platsbanken och SCB. Byggd för Kompetensrådet Region Jönköping.",
  alternates: { canonical: "/" },
};

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
          <path d="M-40 80 Q 180 55 400 100 T 720 75" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 140 Q 160 115 380 160 T 720 135" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 200 Q 200 175 420 220 T 720 195" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 260 Q 180 235 400 280 T 720 255" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 320 Q 220 295 440 340 T 720 315" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 380 Q 200 355 400 400 T 720 375" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <text x="440" y="95" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.45" letterSpacing="0.1em">— 51 m</text>
          <text x="440" y="155" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.45" letterSpacing="0.1em">— 42 m</text>
          <text x="440" y="215" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.45" letterSpacing="0.1em">— 33 m</text>
          <text x="440" y="275" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.45" letterSpacing="0.1em">— 24 m</text>
          <text x="440" y="335" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.45" letterSpacing="0.1em">— 15 m</text>
        </svg>
        <HeroNet />
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
            <Link href="#sektorer" className="btn-main">
              Välj sektor →
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

      <div className="split" id="sektorer">
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
          <div className="sec-tag">Transferabilitetsgrafen · Jönköpings län</div>
          <h2 className="sec-head">13 kommuner — levande kompetensdata.</h2>
          <p className="body-t">
            Noder representerar kommuner. Kanter visar kompetensöverlapp
            via Arbetsförmedlingens substitutabilitetsdata.
          </p>
          <RegionCanvas />
          <ul className="matches" style={{ marginTop: "1.5rem" }}>
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
          <div style={{ marginTop: "1.5rem" }}>
            <AIActDisclaimer variant="chat" />
          </div>
        </div>
      </div>
    </main>
  );
}
