import Link from "next/link";
import HeroNet from "@/components/HeroNet";
import RegionGraph from "@/components/RegionGraph";
import LayerCanvas from "@/components/LayerCanvas";

const TRANSITIONS = [
  { from: "Projektledning", to: "Processanalytiker", pct: 87 },
  { from: "Logistik", to: "Hållbarhetsstrateg", pct: 74 },
  { from: "Handel", to: "Digital koordinator", pct: 61 },
  { from: "Vård", to: "Dataanalytiker", pct: 58 },
];

const LAYERS = [
  {
    n: "01",
    name: "Semantiska lagret",
    tech: "NLP · Vektorembeddings · Qdrant",
    question: "Frågan lagret ställer:",
    explain:
      '"Vad KAN du egentligen, oavsett vad du kallat det?"\n\nFöreställ dig att ditt CV är en låda med Lego-bitar. Det spelar ingen roll om biten heter "kundtjänst" eller "client management". Crosstrees ser formen på biten, inte etiketten. En AI läser varje mening och omvandlar den till koordinater i ett rum med 8 000 dimensioner. Kompetenser som liknar varandra hamnar nära varandra i det rummet.',
    variant: "semantic" as const,
    cls: "l1",
  },
  {
    n: "02",
    name: "Taxonomiska lagret",
    tech: "ESCO · SSYK · AF Substitutabilitet",
    question: "Frågan lagret ställer:",
    explain:
      '"Hur nära är ditt yrke andra yrken, matematiskt?"\n\nAF har räknat ut exakt hur mycket yrken överlappar, baserat på miljoner jobbannonser. Siffran kallas substitutabilitetsvärde: 75 = nästan identiska, 25 = ganska olika. Crosstrees traverserar den här grafen som ett GPS-system. Kortaste vägen från A till B, men mätt i kompetens, inte kilometer.',
    variant: "taxonomic" as const,
    cls: "l2",
  },
  {
    n: "03",
    name: "Regionala lagret",
    tech: "Yrkesbarometern · AF Efterfrågeprognos",
    question: "Frågan lagret ställer:",
    explain:
      '"Finns det faktiskt jobb där du bor, om 5 år?"\n\nDet spelar ingen roll hur bra matchningen är om det inte finns jobb. Crosstrees hämtar AF:s femårsprognos per yrke och region. Om du matchar perfekt mot ett yrke som håller på att försvinna pekar vi dig vidare. Vi rekommenderar bara vägar som faktiskt leder någonstans.',
    variant: "regional" as const,
    cls: "l3",
  },
];

export default function StartPage() {
  const regionUrl =
    process.env.NEXT_PUBLIC_KOMPETENSGRAFEN_URL ??
    "https://crosstreeslaborintelligence.vercel.app";

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
          <path d="M-40 120 Q 200 90 400 140 T 720 110" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 180 Q 180 150 380 200 T 720 170" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 240 Q 220 210 420 260 T 720 230" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 300 Q 200 270 400 320 T 720 290" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <path d="M-40 360 Q 240 330 440 380 T 720 350" fill="none" stroke="#1A1A18" strokeWidth="0.8" />
          <text x="430" y="135" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 51 m</text>
          <text x="430" y="195" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 42 m</text>
          <text x="430" y="255" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 33 m</text>
          <text x="430" y="315" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 24 m</text>
        </svg>
        <HeroNet />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Infrastruktur · inte en jobbsajt</span>
          </div>
          <div className="h1">
            Navigera
            <br />
            på <span className="accent">kompetens,</span>
            <br />
            inte titlar.
          </div>
          <p className="tagline">
            Intelligenslagret som saknats under Platsbanken — byggt på
            Arbetsförmedlingens egna öppna data och ESCO-taxonomin.
          </p>
          <div className="cta-row">
            <Link href="/karriar" className="btn-main">
              Analysera min kompetens →
            </Link>
            <a href={regionUrl} className="btn-ghost">
              För regioner
            </a>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-cell">
          <div className="band-label">Karriärövergångar</div>
          <div className="band-val">51 000</div>
          <div className="band-note">Kartlagda i AF:s öppna data</div>
        </div>
        <div className="band-cell">
          <div className="band-label">Matchningsalgoritm</div>
          <div className="band-val">3-lager</div>
          <div className="band-note">Semantisk · Taxonomisk · Regional</div>
        </div>
        <div className="band-cell">
          <div className="band-label">Pilotdriftsättning</div>
          <div className="band-val">Q3 2026</div>
          <div className="band-note">Direktupphandling, LOU</div>
        </div>
      </section>

      <section className="split">
        <div className="split-left">
          <div className="rope-band" />
          <div className="sec-tag">För medborgaren · Karriärverktyg</div>
          <h2 className="sec-head">Karriärvägar som är osynliga i Platsbanken.</h2>
          <p className="body-t">
            Ladda upp ditt CV. Crosstrees identifierar transferabla kompetenser mot
            ESCO-taxonomin och visar karriärövergångar som nyckelordsbaserade
            system aldrig hittar.
          </p>
          <ul className="matches">
            {TRANSITIONS.map((t) => (
              <li className="m-row" key={`${t.from}-${t.to}`}>
                <span className="m-name">{t.from} → {t.to}</span>
                <span className="m-pct">{t.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="split-right">
          <div className="sec-tag">För regionen · Kompetensinfrastruktur</div>
          <h2 className="sec-head">Strategisk kompetensdata för beslutsfattare.</h2>
          <p className="body-t">
            Crosstrees regiondashboard ger Kompetensråd realtidsdata om lokalt
            kompetensutbud, yrkesövergångar och kompetensgap — baserat på faktisk
            arbetsmarknad, inte antaganden.
          </p>
          <RegionGraph />
        </div>
      </section>

      <section className="layers-intro">
        <p className="layers-eyebrow">Hur Crosstrees fungerar</p>
        <h2 className="layers-h2">Tre frågor.<br />En matchning.</h2>
        <p className="layers-desc">
          Platsbanken frågar: "Vad heter ditt jobb?" Crosstrees frågar tre helt
          andra frågor samtidigt, och det är därför vi hittar karriärvägar som
          Platsbanken aldrig ser.
        </p>
      </section>

      <section className="layers">
        {LAYERS.map((l) => (
          <article key={l.n} className={`layer-card ${l.cls}`}>
            <div className="layer-left">
              <div className="layer-num">{l.n}</div>
              <div>
                <div className="layer-name">{l.name}</div>
                <div className="layer-tech">{l.tech}</div>
              </div>
            </div>
            <div className="layer-mid">
              <p className="layer-q-label">{l.question}</p>
              <p className="layer-explain">{l.explain}</p>
            </div>
            <div className="layer-canvas-wrap">
              <LayerCanvas variant={l.variant} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
