import CVUpload from "@/components/CVUpload";
import AIActDisclaimer from "@/components/AIActDisclaimer";

export default function StartPage() {
  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>TalentFlow</h1>
      <p>
        Ladda upp ditt CV och se vad du är värd på arbetsmarknaden. Få
        jobbmatchningar, karriärvägar och konkreta utbildningsförslag.
      </p>
      <AIActDisclaimer variant="intro" />
      <p style={{ fontSize: "0.9rem", color: "#444" }}>
        <strong>Datakällor:</strong> Arbetsförmedlingens Platsbanken, AF
        substitutabilitetsdata, ESCO-kompetenstaxonomi, SCB Lönestrukturstatistik
        2024.
      </p>
      <p style={{ fontSize: "0.9rem", color: "#444" }}>
        <strong>Integritet:</strong> Ditt CV bearbetas av AI för att extrahera
        kompetenser. Inget sparas permanent. Resultatet är tillgängligt i en
        timme och försvinner sedan automatiskt.
      </p>
      <p style={{ fontSize: "0.85rem", color: "#666" }}>
        Utvecklare: Crosstrees Labor Intelligence, Vetlanda, Sverige —{" "}
        kontakt@crosstrees.se
      </p>
      <CVUpload />
    </main>
  );
}
