import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";

const SEKTORER = [
  { id: "industri", namn: "Tillverkning & industri", beskrivning: "Maskinoperatörer · svetsare · automationstekniker · vindkrafttekniker" },
  { id: "vard", namn: "Vård & omsorg", beskrivning: "Undersköterskor · sjuksköterskor · personliga assistenter" },
  { id: "it", namn: "IT & digitalisering", beskrivning: "Mjukvaruutvecklare · systemarkitekter · dataingenjörer" },
  { id: "bygg", namn: "Bygg & anläggning", beskrivning: "Elektriker · snickare" },
  { id: "logistik", namn: "Logistik & transport", beskrivning: "Truckförare · lastbilsförare · lagerarbetare" },
  { id: "service", namn: "Service & handel", beskrivning: "Butikschefer · kockar · restaurangchefer" },
  { id: "utbildning", namn: "Utbildning", beskrivning: "Lärare i grundskolan · förskollärare" },
];

export default function StartPage() {
  return (
    <main className="page">
      <h1>Underlag för regional kompetensförsörjning</h1>
      <p>
        Från frågeställning till exporterad PDF-rapport på under tre minuter.
        Underlag från Arbetsförmedlingens Platsbanken, substitutabilitetsdata,
        SCB Yrkesregistret och regionens egna kompetensgraf.
      </p>
      <AIActDisclaimer variant="chat" />

      <section>
        <h2>1 · Välj bransch</h2>
        <p>Bristkarta över länets 13 kommuner laddas med live-data från Platsbanken.</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {SEKTORER.map((s) => (
            <li
              key={s.id}
              style={{
                borderTop: "1px solid var(--chart-line)",
                padding: "0.9rem 0",
              }}
            >
              <Link href={`/analys/${s.id}`} style={{ fontWeight: 700, textDecoration: "none" }}>
                {s.namn} →
              </Link>
              <br />
              <small className="data">{s.beskrivning}</small>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>2 · Övriga verktyg</h2>
        <ul>
          <li>
            <Link href="/omstallning">Omställningsanalys</Link> — kompetensöverlapp mellan yrken.
          </li>
          <li>
            <Link href="/roi">ROI-kalkylator</Link> — bootstrap-konfidensintervall för utbildningsinsatser.
          </li>
          <li>
            <Link href="/chatt">AI-rådgivare</Link> — fritextfrågor om regionens arbetsmarknad.
          </li>
          <li>
            <Link href="/export">PDF-rapport</Link> — beslutsunderlag på svenska.
          </li>
        </ul>
      </section>

      <footer style={{ paddingTop: "1.5rem", marginTop: "3rem" }}>
        <small className="data">
          DATAKÄLLOR — AF PLATSBANKEN · AF SUBSTITUTABILITET · JOBED CONNECT · SCB
          LÖNESTRUKTURSTATISTIK 2024 · SCB GEODATA REGSO 2025 · NEO4J
        </small>
        <br />
        <small className="data">
          UTVECKLARE — CROSSTREES LABOR INTELLIGENCE · VETLANDA · KONTAKT@CROSSTREES.SE
        </small>
      </footer>
    </main>
  );
}
