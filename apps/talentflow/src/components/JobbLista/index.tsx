import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import DataLabel from "@/components/DataLabel";

interface AFJobHit {
  id: string;
  headline?: string;
  title?: string;
  employer?: { name?: string } | string;
  workplace_address?: { municipality?: string };
  publication_date?: string;
}

interface Props {
  sessionId: string;
}

function employerName(job: AFJobHit): string {
  if (typeof job.employer === "string") return job.employer;
  return job.employer?.name ?? "Okänd arbetsgivare";
}

function jobTitle(job: AFJobHit): string {
  return job.headline ?? job.title ?? "Tjänst utan titel";
}

export default async function JobbLista({ sessionId }: Props) {
  let jobs: AFJobHit[];
  try {
    jobs = await apiClient<AFJobHit[]>(`/match/jobs?session=${sessionId}`);
  } catch {
    return (
      <section aria-label="Matchande jobb" style={{ marginTop: "1.5rem" }}>
        <h2>Matchande jobb</h2>
        <p className="body-t" style={{ fontStyle: "italic" }}>
          Kunde inte nå Platsbanken just nu. Försök igen om en stund.
        </p>
      </section>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <section aria-label="Matchande jobb" style={{ marginTop: "1.5rem" }}>
        <h2>Matchande jobb</h2>
        <p className="body-t" style={{ fontStyle: "italic" }}>
          Inga matchande jobb hittades för dina kompetenser i Jönköpings län just nu.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Matchande jobb" style={{ marginTop: "1.5rem" }}>
      <h2>Bäst matchande jobb just nu</h2>
      <ul className="matches">
        {jobs.map((job) => (
          <li className="m-row" key={job.id}>
            <span className="m-name">
              <Link href={`/jobb/${job.id}`} style={{ color: "inherit" }}>
                {jobTitle(job)}
              </Link>
              <span className="coord" style={{ display: "block", marginTop: "2px" }}>
                {employerName(job)}
                {job.workplace_address?.municipality && ` · ${job.workplace_address.municipality}`}
              </span>
            </span>
            <Link href={`/jobb/${job.id}`} className="m-pct" style={{ textDecoration: "none", fontSize: "11px" }}>
              →
            </Link>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "1rem" }}>
        <DataLabel source="AF Platsbanken" date={new Date().toLocaleDateString("sv-SE")} />
      </div>
    </section>
  );
}
