import Link from "next/link";
import type { JobHit } from "@/lib/api";
import { employerName, jobLocation, jobTitle } from "@/lib/api";
import MatchKvalitet from "@/components/MatchKvalitet";

interface Props {
  index: number;
  job: JobHit;
  sessionId: string;
  score?: { value: number; low: number; high: number } | null;
  scoreError?: string;
}

export default function JobbRad({ index, job, sessionId, score, scoreError }: Props) {
  return (
    <Link
      href={`/yrke/${encodeURIComponent(job.id)}?session=${encodeURIComponent(sessionId)}`}
      className="match-row"
    >
      <span className="match-num">{String(index + 1).padStart(2, "0")}</span>
      <span className="match-body">
        <span className="match-title">{jobTitle(job)}</span>
        <span className="match-meta">
          {employerName(job)}
          {jobLocation(job) && ` · ${jobLocation(job)}`}
        </span>
      </span>
      <span className="match-quality">
        {score ? (
          <MatchKvalitet score={score.value} ciLow={score.low} ciHigh={score.high} />
        ) : scoreError ? (
          <span className="depth-ci" style={{ color: "var(--signal-rust)" }}>
            ej beräknad
          </span>
        ) : (
          <span className="depth-ci">—</span>
        )}
      </span>
    </Link>
  );
}
