import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";

const SEKTORER = [
  { id: "industri", namn: "Tillverkning och industri", beskrivning: "Maskinoperatörer, svetsare, automationstekniker, vindkrafttekniker" },
  { id: "vard", namn: "Vård och omsorg", beskrivning: "Undersköterskor, sjuksköterskor, personliga assistenter" },
  { id: "it", namn: "IT och digitalisering", beskrivning: "Mjukvaruutvecklare, systemarkitekter, dataingenjörer" },
  { id: "bygg", namn: "Bygg och anläggning", beskrivning: "Elektriker, snickare" },
  { id: "logistik", namn: "Logistik och transport", beskrivning: "Truckförare, lastbilsförare, lagerarbetare" },
  { id: "service", namn: "Service och handel", beskrivning: "Butikschefer, kockar, restaurangchefer" },
  { id: "utbildning", namn: "Utbildning", beskrivning: "Lärare i grundskolan, förskollärare" },
];

export default function StartPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1rem" }}>
      <header>
        <h1>Kompetensrådet i Jönköpings län</h1>
        <p style={{ fontSize: "1.1rem", color: "#444" }}>
          Datainformerat beslutsstöd för regional kompetensförsörjning. Från
          frågeställning till exporterad PDF-rapport på under tre minuter.
        </p>
      </header>

      <AIActDisclaimer variant="chat" />

      <section style={{ marginTop: "2rem" }}>
        <h2>1. Välj bransch</h2>
        <p>
          Starta din analys genom att välja en sektor. Du får en bristkarta över
          länets 13 kommuner med live-data från Platsbanken.
        </p>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
          {SEKTORER.map((s) => (
            <li
              key={s.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "0.75rem 1rem",
              }}
            >
              <Link href={`/analys/${s.id}`} style={{ fontWeight: 600 }}>
                {s.namn} →
              </Link>
              <p style={{ margin: "0.25rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                {s.beskrivning}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Övriga verktyg</h2>
        <nav>
          <ul>
            <li>
              <Link href="/omstallning">Omställningsanalys</Link> — vilka yrken
              kan ställas om till bristyrken?
            </li>
            <li>
              <Link href="/roi">ROI-kalkylator</Link> — bootstrap-konfidensintervall
              för utbildningsinsatser
            </li>
            <li>
              <Link href="/chatt">AI-rådgivare</Link> — ställ fritextfrågor om
              arbetsmarknaden
            </li>
            <li>
              <Link href="/export">Exportera PDF-rapport</Link> — svensk
              beslutsunderlag
            </li>
          </ul>
        </nav>
      </section>

      <footer style={{ marginTop: "3rem", paddingTop: "1rem", borderTop: "1px solid #eee", color: "#666", fontSize: "0.85rem" }}>
        <p>
          <strong>Datakällor:</strong> Arbetsförmedlingens Platsbanken,
          substitutabilitetsdata, JobEd Connect, SCB Lönestrukturstatistik 2024,
          SCB Geodata RegSO 2025, Neo4j substitutabilitetsgraf.
        </p>
        <p>
          Utvecklare: Crosstrees Labor Intelligence, Vetlanda, Sverige —{" "}
          kontakt@crosstrees.se
        </p>
      </footer>
    </main>
  );
}
