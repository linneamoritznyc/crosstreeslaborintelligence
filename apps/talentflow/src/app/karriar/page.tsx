import { Suspense } from "react";
import KarriarGraf from "@/components/KarriarGraf";
import KompetensgapPanel from "@/components/KompetensgapPanel";

export default function KarriarPage() {
  return (
    <main>
      <h1>Din karriärväg</h1>
      <Suspense fallback={<p>Laddar karriärkarta…</p>}>
        <KarriarGraf />
        <KompetensgapPanel />
      </Suspense>
    </main>
  );
}
