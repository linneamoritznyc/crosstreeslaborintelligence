import { Suspense } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import DataLabel from "@/components/DataLabel";
import FitScoreKort from "@/components/FitScoreKort";

interface AFJob {
  id: string;
  headline?: string;
  title?: string;
  description?: { text?: string } | string;
  employer?: { name?: string } | string;
  workplace_address?: { municipality?: string };
  application_details?: { url?: string };
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
}

function readEmployer(j: AFJob): string {
  if (typeof j.employer === "string") return j.employer;
  return j.employer?.name ?? "Okänd arbetsgivare";
}

function readTitle(j: AFJob): string {
  return j.headline ?? j.title ?? "Tjänst utan titel";
}

function readDescription(j: AFJob): string {
  if (typeof j.description === "string") return j.description;
  return j.description?.text ?? "Ingen beskrivning tillgänglig.";
}

export default async function JobbDetaljPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { session } = await searchParams;

  let jobb: AFJob;
  try {
    jobb = await apiClient<AFJob>(`/jobs/${id}`);
  } catch {
    const backHref = session ? `/resultat?session=${session}` : "/resultat";
    return (
      <main className="page">
        <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
          <div className="eyebrow-line" />
          <span className="eyebrow-text">← <Link href={backHref} style={{ color: "inherit", textDecoration: "none" }}>MATCHNINGAR</Link></span>
        </div>
        <h1>Annonsen kunde inte hämtas</h1>
        <p className="body-t">Annonsen kan ha tagits bort från Platsbanken. Försök igen om en stund.</p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="btn-ghost" style={{ display: "inline-flex", borderLeft: "0.5px solid var(--ink)" }}>
            Tillbaka till start
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href={session ? `/resultat?session=${session}` : "/resultat"} style={{ color: "inherit", textDecoration: "none" }}>← MATCHNINGAR</Link>
          {" · ANNONS"}
        </span>
      </div>
      <h1>{readTitle(jobb)}</h1>
      <p className="coord">
        {readEmployer(jobb)}
        {jobb.workplace_address?.municipality && ` · ${jobb.workplace_address.municipality}`}
      </p>
      <h2>Beskrivning</h2>
      <p style={{ whiteSpace: "pre-wrap", maxWidth: "70ch", fontSize: "13px", lineHeight: "1.78" }}>
        {readDescription(jobb)}
      </p>
      {jobb.application_details?.url && (
        <div style={{ marginTop: "1.5rem" }}>
          <a href={jobb.application_details.url} target="_blank" rel="noopener noreferrer" className="btn-main" style={{ display: "inline-flex" }}>
            Ansök på arbetsgivarens sida →
          </a>
        </div>
      )}
      {session && (
        <div style={{ marginTop: "2rem" }}>
          <Suspense fallback={<p className="coord">Beräknar matchningspoäng…</p>}>
            <FitScoreKort sessionId={session} jobId={id} />
          </Suspense>
        </div>
      )}
      <div style={{ marginTop: "2rem" }}>
        <DataLabel source="AF Platsbanken" />
      </div>
    </main>
  );
}
