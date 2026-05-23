import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import DataLabel from "@/components/DataLabel";

interface AFEmployer {
  name?: string;
}
interface AFMunicipality {
  label?: string;
}

interface AFJobHit {
  id: string;
  headline?: string;
  title?: string;
  employer?: AFEmployer | string;
  workplace_address?: { municipality?: string };
  publication_date?: string;
  description?: { text?: string };
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
      <section aria-label="Matchande jobb">
        <h2>Matchande jobb</h2>
        <p>
          <em>Kunde inte nå Platsbanken just nu. Försök igen om en stund.</em>
        </p>
      </section>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <section aria-label="Matchande jobb">
        <h2>Matchande jobb</h2>
        <p>
          <em>
            Inga matchande jobb hittades för dina kompetenser i Jönköpings län just
            nu.
          </em>
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Matchande jobb">
      <h2>Bäst matchande jobb just nu</h2>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <Link href={`/jobb/${job.id}`}>
              <strong>{jobTitle(job)}</strong>
            </Link>
            <br />
            <small>{employerName(job)}</small>
          </li>
        ))}
      </ul>
      <DataLabel
        source="AF Platsbanken"
        date={new Date().toLocaleDateString("sv-SE")}
      />
    </section>
  );
}
