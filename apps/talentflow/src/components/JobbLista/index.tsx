import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface Job {
  id: string;
  title: string;
  employer: string;
  description?: string | null;
  municipality?: string | null;
  published_at?: string | null;
}

interface Props {
  sessionId: string;
}

export default async function JobbLista({ sessionId }: Props) {
  let jobs: Job[] = [];
  let error: string | null = null;
  try {
    jobs = await apiClient<Job[]>(`/match/jobs?session=${sessionId}`);
  } catch (err) {
    error = err instanceof Error ? err.message : "Kunde inte hämta jobblistan";
  }

  if (error) return <p role="alert">{error}</p>;

  if (jobs.length === 0) {
    return <p>Inga matchande jobb hittades just nu. Försök igen senare.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {jobs.map((job) => (
        <li
          key={job.id}
          style={{
            padding: 14,
            marginBottom: 10,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border-soft)",
            borderRadius: 8,
          }}
        >
          <Link href={`/jobb/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <strong style={{ display: "block" }}>{job.title}</strong>
            <span style={{ color: "var(--color-ink-muted)", fontSize: "0.875rem" }}>
              {job.employer}
              {job.municipality && ` · ${job.municipality}`}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
