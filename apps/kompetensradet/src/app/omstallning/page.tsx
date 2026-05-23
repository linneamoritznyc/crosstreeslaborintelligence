import Link from "next/link";
import { Suspense } from "react";
import OmstallningsPanel from "@/components/OmstallningsPanel";

interface Props {
  searchParams: Promise<{ target?: string }>;
}

export default async function OmstallningPage({ searchParams }: Props) {
  const { target } = await searchParams;
  return (
    <main style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1rem" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
        <Link href="/">← Tillbaka</Link>
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
