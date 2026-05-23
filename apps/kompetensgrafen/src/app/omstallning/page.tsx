import Link from "next/link";
import { Suspense } from "react";
import OmstallningsPanel from "@/components/OmstallningsPanel";

interface Props {
  searchParams: Promise<{ target?: string }>;
}

export default async function OmstallningPage({ searchParams }: Props) {
  const { target } = await searchParams;
  return (
    <main className="page">
      <nav style={{ paddingTop: "0.5rem", marginBottom: "1rem" }}>
        <small className="data">
          <Link href="/">← TILLBAKA</Link>
        </small>
      </nav>
      <h1>Omställningsanalys</h1>
      <p>
        Vilka yrken har störst kompetensöverlapp med ett målyrke? Underlag från
        Arbetsförmedlingens substitutabilitetsdata och Neo4j-grafen.
      </p>
      <Suspense fallback={<p>Laddar omställningsdata…</p>}>
        <OmstallningsPanel target={target} />
      </Suspense>
    </main>
  );
}
