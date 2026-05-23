import CVUpload from "@/components/CVUpload";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import DemoSession from "@/components/DemoSession";

export default function StartPage() {
  return (
    <main>
      <h1>Navigera på kompetens, inte titlar</h1>
      <p>
        Ladda upp ditt CV och få jobb och karriärvägar som faktiskt matchar dina
        kompetenser — inte bara dina tidigare titlar.
      </p>

      <AIActDisclaimer variant="intro" />

      <section>
        <h2>Ladda upp ditt CV</h2>
        <CVUpload />
      </section>

      <section>
        <h2>Eller pröva en demoprofil</h2>
        <p>Utan att ladda upp något. Välj en exempelyrkesgrupp och se flödet.</p>
        <DemoSession />
      </section>

      <section>
        <h3>Datakällor</h3>
        <p>
          Arbetsförmedlingens Platsbanken, AF substitutabilitetsdata,
          ESCO-kompetenstaxonomi, SCB Lönestrukturstatistik 2024.
        </p>
        <h3>Integritet</h3>
        <p>
          Ditt CV bearbetas av AI för att extrahera kompetenser. Inget sparas
          permanent. Resultatet är tillgängligt i en timme och försvinner sedan
          automatiskt.
        </p>
      </section>

      <footer style={{ paddingTop: "1.5rem", marginTop: "3rem" }}>
        <small className="data">
          UTVECKLARE — CROSSTREES LABOR INTELLIGENCE · VETLANDA · KONTAKT@CROSSTREES.SE
        </small>
      </footer>
    </main>
  );
}
