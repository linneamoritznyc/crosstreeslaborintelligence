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
      <main>
        <h1>Din karriärväg</h1>
        <p>
          Ingen CV-session angiven.{" "}
          <Link href="/">Tillbaka till start.</Link>
        </p>
      </main>
    );
  }

  return (
    <main>
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
