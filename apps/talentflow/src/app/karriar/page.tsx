import { Suspense } from "react";
import Link from "next/link";
import KarriarGraf from "@/components/KarriarGraf";
import CVUpload from "@/components/CVUpload";
import DemoSession from "@/components/DemoSession";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export default async function KarriarPage({ searchParams }: Props) {
  const { session } = await searchParams;

  if (!session) {
    return (
      <main className="page">
        <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
          <div className="eyebrow-line" />
          <span className="eyebrow-text">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← START</Link>
            {" · KOMPETENSANALYS"}
          </span>
        </div>
        <h1>Analysera din kompetens</h1>
        <p className="tagline" style={{ fontSize: "15px", marginBottom: "1rem" }}>
          Crosstrees identifierar transferabla kompetenser och visar karriärvägar
          som Platsbanken aldrig hittar.
        </p>

        <section>
          <h2>Ladda upp CV</h2>
          <p className="body-t">
            PDF eller Word. Claude AI extraherar kompetenser mot ESCO-taxonomin.
            Din fil lämnar aldrig sessionen.
          </p>
          <CVUpload />
        </section>

        <section style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "0.5px solid var(--border-faint)" }}>
          <h2>Prova utan CV</h2>
          <p className="body-t">Välj en fördefinierad yrkesprofil för en omedelbar demo.</p>
          <DemoSession />
        </section>

        <AIActDisclaimer variant="score" />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← START</Link>
          {" · KARRIÄRPOTENTIAL"}
        </span>
      </div>
      <h1>Din karriärväg</h1>
      <p className="coord">
        Beräknad via Personalized PageRank · AF substitutabilitetsgraf · session {session.slice(0, 8)}…
      </p>
      <Suspense fallback={<p className="body-t" style={{ marginTop: "2rem" }}>Laddar karriärkarta…</p>}>
        <KarriarGraf sessionId={session} />
      </Suspense>
      <div style={{ marginTop: "1.5rem" }}>
        <Link href={`/resultat?session=${session}`} className="btn-main" style={{ display: "inline-flex" }}>
          Se matchade jobb →
        </Link>
      </div>
      <AIActDisclaimer variant="graph" />
    </main>
  );
}
