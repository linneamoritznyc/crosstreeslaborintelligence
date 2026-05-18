import { Suspense } from "react";
import Link from "next/link";
import KarriarGraf from "@/components/KarriarGraf";
import KompetensgapPanel from "@/components/KompetensgapPanel";

interface Props {
  searchParams: Promise<{ session?: string; target?: string }>;
}

export const metadata = { title: "Karriärvägar — TalentFlow" };

export default async function KarriarPage({ searchParams }: Props) {
  const { session, target } = await searchParams;

  if (!session) {
    return (
      <main>
        <section className="card">
          <h1>Karriärvägar saknar session</h1>
          <p>Ladda upp ett CV för att se möjliga karriärvägar.</p>
          <Link href="/" className="btn-link">Tillbaka till start</Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="card">
        <h1>Din karriärväg</h1>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Beräknat via Personalized PageRank på AF substitutabilitetsdata.
        </p>
      </section>
      <Suspense fallback={<p>Laddar karriärkarta…</p>}>
        <section className="card">
          <KarriarGraf sessionId={session} />
        </section>
        {target && (
          <section className="card">
            <KompetensgapPanel sessionId={session} targetOccupationId={target} />
          </section>
        )}
      </Suspense>
      <aside className="ai-disclaimer" role="note">
        <strong>AI-genererad analys</strong>
        <span>
          Karriärrekommendationerna baseras på Personalized PageRank och
          ESCO-kompetensgrafer. Beslut om utbildning eller jobbansökan fattas
          alltid av dig.
        </span>
      </aside>
    </main>
  );
}
