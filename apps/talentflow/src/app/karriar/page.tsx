import { Suspense } from "react";
import Link from "next/link";
import KarriarGraf from "@/components/KarriarGraf";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export default async function KarriarPage({ searchParams }: Props) {
  const { session } = await searchParams;

  if (!session) {
    return (
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Din karriärväg</h1>
        <p>
          Ingen CV-session angiven.{" "}
          <Link href="/">Gå tillbaka och ladda upp ditt CV.</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Din karriärväg</h1>
      <Suspense fallback={<p>Laddar karriärkarta…</p>}>
        <KarriarGraf sessionId={session} />
      </Suspense>
      <AIActDisclaimer variant="graph" />
    </main>
  );
}
