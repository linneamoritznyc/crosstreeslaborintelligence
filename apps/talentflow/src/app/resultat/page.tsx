import { Suspense } from "react";
import Link from "next/link";
import JobbLista from "@/components/JobbLista";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export default async function ResultatPage({ searchParams }: Props) {
  const { session: sessionId = "" } = await searchParams;

  if (!sessionId) {
    return (
      <main>
        <h1>Inga matchningar</h1>
        <p>
          <Link href="/">Ladda upp ditt CV</Link> för att komma igång.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Dina matchningar</h1>
      <p>Välj ett jobb för att läsa mer, eller utforska din karriärväg.</p>
      <Suspense fallback={<p>Laddar matchningar…</p>}>
        <JobbLista sessionId={sessionId} />
      </Suspense>
      <Link href={`/karriar?session=${sessionId}`} className="karriar-link">
        Utforska din karriärväg →
      </Link>
    </main>
  );
}
