import CVUpload from "@/components/CVUpload";

export default function StartPage() {
  return (
    <main>
      <section className="card">
        <span className="pill">EU AI Act · Bilaga III punkt 4</span>
        <h1 style={{ margin: "12px 0 8px" }}>TalentFlow</h1>
        <p style={{ fontSize: "1.0625rem", color: "var(--color-ink-soft)" }}>
          Ladda upp ditt CV för att få personliga jobbmatchningar, karriärvägar
          och kompetensgapanalys baserat på Arbetsförmedlingens öppna data.
        </p>
      </section>
      <section className="card">
        <CVUpload />
      </section>
    </main>
  );
}
