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
      <main>
        <h1>Dina matchningar</h1>
        <p>
          Ingen CV-session angiven.{" "}
          <Link href="/">Tillbaka till start.</Link>
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Dina matchningar</h1>
      <p>Live från Arbetsförmedlingens Platsbanken, rankade på kompetensöverlapp.</p>
      <nav style={{ paddingTop: "0.75rem", marginBottom: "1.5rem" }}>
        <small className="data">
          <Link href={`/karriar?session=${session}`}>→ KARRIÄRPOTENTIAL</Link>
        </small>
      </nav>
      <Suspense fallback={<p>Laddar matchningar…</p>}>
        <JobbLista sessionId={session} />
      </Suspense>
      <AIActDisclaimer variant="score" />
    </main>
  );
}
