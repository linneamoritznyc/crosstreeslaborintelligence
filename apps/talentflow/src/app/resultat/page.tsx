import { Suspense } from "react";
import JobbLista from "@/components/JobbLista";
import FitScoreKort from "@/components/FitScoreKort";

export default function ResultatPage() {
  return (
    <main>
      <h1>Dina matchningar</h1>
      <Suspense fallback={<p>Laddar matchningar…</p>}>
        <FitScoreKort />
        <JobbLista />
      </Suspense>
    </main>
  );
}
