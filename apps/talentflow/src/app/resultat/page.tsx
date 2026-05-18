import { Suspense } from "react";
import Link from "next/link";
import JobbLista from "@/components/JobbLista";

interface Props {
  searchParams: Promise<{ session?: string; job?: string }>;
}

export const metadata = { title: "Dina matchningar — TalentFlow" };

export default async function ResultatPage({ searchParams }: Props) {
  const { session } = await searchParams;

  if (!session) {
    return (
      <main>
        <section className="card">
          <h1>Inga matchningar att visa</h1>
          <p>Ladda upp ett CV för att få jobbmatchningar.</p>
          <Link href="/" className="btn-link">Tillbaka till start</Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="card">
        <span className="pill">Resultat</span>
        <h1 style={{ margin: "12px 0 8px" }}>Dina matchningar</h1>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Rankade efter Fit Score (TF-IDF med 95% Wilson-konfidensintervall).
        </p>
      </section>
      <Suspense fallback={<p>Laddar matchningar…</p>}>
        <section className="card">
          <JobbLista sessionId={session} />
        </section>
      </Suspense>
      <aside className="ai-disclaimer" role="note">
        <strong>AI-genererad analys</strong>
        <span>
          Matchningarna är rekommendationer, inte beslut. Du fattar alltid det
          slutliga beslutet om dina ansökningar.
        </span>
      </aside>
    </main>
  );
}
