import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import OmstallningsPanel from "@/components/OmstallningsPanel";

export const metadata: Metadata = {
  title: "Omställningsanalys — karriärövergångar via ESCO-substitutabilitet",
  description:
    "Se vilka yrken som kan substituera ett bristyrke i Jönköpings läns arbetsmarknad. " +
    "Baserat på Arbetsförmedlingens ESCO-substitutabilitetsdata och Neo4j-grafen.",
  alternates: { canonical: "https://kompetensgrafen.crosstrees.se/omstallning" },
};

interface Props {
  searchParams: Promise<{ target?: string }>;
}

export default async function OmstallningPage({ searchParams }: Props) {
  const { target } = await searchParams;
  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← ÖVERSIKT</Link>
          {" · OMSTÄLLNINGSANALYS"}
        </span>
      </div>
      <h1>Omställning</h1>
      <p className="tagline" style={{ fontSize: "15px", marginBottom: "0.75rem" }}>
        Vilka yrken har störst kompetensöverlapp med ett målyrke?
      </p>
      <p className="body-t">
        Underlag från Arbetsförmedlingens substitutabilitetsdata och Neo4j-grafen.
        Substitutabilitetsvärde 75 = nästan identiska yrken, 25 = ganska olika.
      </p>
      <div style={{ marginTop: "1.5rem" }}>
        <Suspense fallback={<p className="coord" style={{ marginTop: "2rem" }}>Laddar omställningsdata…</p>}>
          <OmstallningsPanel target={target} />
        </Suspense>
      </div>
    </main>
  );
}
