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
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Dina matchningar</h1>
        <p>
          Ingen CV-session angiven.{" "}
          <Link href="/">Gå tillbaka och ladda upp ditt CV.</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Dina matchningar</h1>
      <nav style={{ marginBottom: "1rem" }}>
        <Link href={`/karriar?session=${session}`}>Se karriärpotential →</Link>
      </nav>
      <Suspense fallback={<p>Laddar matchningar…</p>}>
        <JobbLista sessionId={session} />
      </Suspense>
      <AIActDisclaimer variant="score" />
    </main>
  );
}
