import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import type { Job } from "../../../../../../libs/shared-types/job";

interface Props {
  sessionId: string;
}

export default async function JobbLista({ sessionId }: Props) {
  const jobs = await apiClient<Job[]>(`/match/jobs?session=${sessionId}`);

  if (jobs.length === 0) {
    return <p>Inga matchande jobb hittades.</p>;
  }

  return (
    <ul>
      {jobs.map((job) => (
        <li key={job.id}>
          <Link href={`/jobb/${job.id}`}>
            <strong>{job.title}</strong> — {job.employer}
          </Link>
        </li>
      ))}
    </ul>
  );
}
