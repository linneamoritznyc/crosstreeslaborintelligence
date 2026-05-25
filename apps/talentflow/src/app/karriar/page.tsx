import { Suspense } from "react";
import KarriarGraf from "@/components/KarriarGraf";
import CVUpload from "@/components/CVUpload";
import DemoSession from "@/components/DemoSession";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export default async function KarriarPage({ searchParams }: Props) {
  const { session } = await searchParams;

  if (!session) {
    return (
      <main className="page">
        <h1>Analysera din kompetens</h1>
        <p>
          Ladda upp ditt CV så identifierar Crosstrees transferabla kompetenser
          och visar karriärvägar som Platsbanken aldrig hittar.
        </p>

        <section>
          <h2>Ladda upp CV</h2>
          <CVUpload />
        </section>

        <section style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--chart-line)" }}>
          <h2>Prova utan CV</h2>
          <p>
            <small className="data">Välj en fördefinierad yrkesprofil för en omedelbar demo.</small>
          </p>
          <DemoSession />
        </section>

        <AIActDisclaimer variant="score" />
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Din karriärväg</h1>
      <p>
        Beräknad via Personalized PageRank på Arbetsförmedlingens
        substitutabilitetsgraf.
      </p>
      <Suspense fallback={<p>Laddar karriärkarta…</p>}>
        <KarriarGraf sessionId={session} />
      </Suspense>
      <AIActDisclaimer variant="graph" />
    </main>
  );
}
