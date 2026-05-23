import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import DataLabel from "@/components/DataLabel";

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

export default async function JobbDetaljPage({ params }: Props) {
  const { id } = await params;

  let jobb: AFJob;
  try {
    jobb = await apiClient<AFJob>(`/jobs/${id}`);
  } catch {
    return (
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Annonsen kunde inte hämtas</h1>
        <p>
          Försök igen om en stund. <Link href="/">Tillbaka till start.</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>{readTitle(jobb)}</h1>
      <p>
        <strong>{readEmployer(jobb)}</strong>
        {jobb.workplace_address?.municipality && ` — ${jobb.workplace_address.municipality}`}
      </p>
      <section>
        <h2>Beskrivning</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{readDescription(jobb)}</p>
      </section>
      {jobb.application_details?.url && (
        <p>
          <a href={jobb.application_details.url} target="_blank" rel="noopener noreferrer">
            Ansök på arbetsgivarens sida →
          </a>
        </p>
      )}
      <DataLabel source="AF Platsbanken" />
    </main>
  );
}
