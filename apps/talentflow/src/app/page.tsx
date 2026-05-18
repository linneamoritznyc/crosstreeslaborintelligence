import CVUpload from "@/components/CVUpload";
import AIDisclaimer from "@/components/AIDisclaimer";

export default function StartPage() {
  return (
    <>
      <section className="hero">
        <span
          className="pill"
          style={{ background: "rgba(255,255,255,0.18)", color: "white" }}
        >
          Gratis · för svenska medborgare
        </span>
        <h1 style={{ marginTop: 12 }}>Hitta ditt nästa steg.</h1>
        <p>
          Ladda upp ditt CV så hittar TalentFlow jobb du verkligen passar för,
          karriärvägar du inte ens kände till, och utbildningar som tar dig
          dit. Bygger på Arbetsförmedlingens öppna data och ESCO-taxonomin.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">Tre saker du får av en uppladdning</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-md)",
            marginTop: "var(--space-md)",
          }}
        >
          {[
            {
              titel: "Bäst matchande jobb",
              text: "Live från Platsbanken, rankade efter Fit Score med 95% konfidensintervall.",
            },
            {
              titel: "Karriärvägar",
              text: "Beräknat via Personalized PageRank på AF substitutabilitetsdata.",
            },
            {
              titel: "Kompetensgap",
              text: "Vilka kompetenser du behöver — och vilka YH-kurser täcker dem.",
            },
          ].map((b) => (
            <div
              key={b.titel}
              style={{
                padding: "var(--space-md)",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border-soft)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <strong style={{ display: "block", marginBottom: 6 }}>
                {b.titel}
              </strong>
              <span
                style={{ color: "var(--color-ink-soft)", fontSize: "0.875rem" }}
              >
                {b.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Ladda upp CV</h2>
        <CVUpload />
      </section>

      <AIDisclaimer variant="long" />
    </>
  );
}
