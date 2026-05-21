import { Suspense } from "react";
import Link from "next/link";
import KarriarGraf from "@/components/KarriarGraf";
import KompetensgapPanel from "@/components/KompetensgapPanel";

interface Props {
  searchParams: Promise<{ session?: string; target?: string }>;
}

export default async function KarriarPage({ searchParams }: Props) {
  const { session: sessionId = "", target: targetOccupationId = "" } = await searchParams;

  if (!sessionId) {
    return (
      <main>
        <h1>Din karriärväg</h1>
        <p>
          <Link href="/">Ladda upp ditt CV</Link> för att se din karriärväg.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Din karriärväg</h1>
      <p>Baserat på ditt CV — möjliga nästa steg i karriären.</p>
      <Suspense fallback={<p>Laddar karriärkarta…</p>}>
        <KarriarGraf sessionId={sessionId} />
        {targetOccupationId && (
          <KompetensgapPanel
            sessionId={sessionId}
            targetOccupationId={targetOccupationId}
          />
        )}
      </Suspense>
    </main>
  );
}
