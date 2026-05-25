import { Suspense } from "react";
import Link from "next/link";
import JobbLista from "@/components/JobbLista";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export default async function ResultatPage({ searchParams }: Props) {
  const { session } = await searchParams;

  if (!session) {
    return (
      <main className="page">
        <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
          <div className="eyebrow-line" />
          <span className="eyebrow-text">MATCHADE JOBB</span>
        </div>
        <h1>Dina matchningar</h1>
        <p className="body-t">Ingen CV-session hittades. Starta en analys för att se dina matchningar.</p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/karriar" className="btn-main" style={{ display: "inline-flex" }}>
            Analysera min kompetens →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href={`/karriar?session=${session}`} style={{ color: "inherit", textDecoration: "none" }}>← KARRIÄRPOTENTIAL</Link>
          {" · MATCHADE JOBB"}
        </span>
      </div>
      <h1>Dina matchningar</h1>
      <p className="coord">
        Live från AF Platsbanken · rankade på kompetensöverlapp · session {session.slice(0, 8)}…
      </p>
      <Suspense fallback={<p className="body-t" style={{ marginTop: "2rem" }}>Laddar matchningar…</p>}>
        <JobbLista sessionId={session} />
      </Suspense>
      <AIActDisclaimer variant="score" />
    </main>
  );
}
