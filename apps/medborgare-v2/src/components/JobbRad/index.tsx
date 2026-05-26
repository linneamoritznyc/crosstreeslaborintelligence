import Link from "next/link";
import type { JobHit } from "@/lib/api";
import { employerName, jobLocation, jobTitle, jobAge } from "@/lib/api";
import MatchKvalitet from "@/components/MatchKvalitet";

interface Props {
  index: number;
  job: JobHit;
  sessionId: string;
  region?: string;
  score?: { value: number; low: number; high: number } | null;
  scoreError?: string;
  hiddenTrigger?: string;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
}

export default function JobbRad({
  index,
  job,
  sessionId,
  region,
  score,
  scoreError,
  hiddenTrigger,
  isSaved,
  onToggleSave,
}: Props) {
  const regionParam = region ? `&region=${encodeURIComponent(region)}` : "";
  const href = `/yrke/${encodeURIComponent(job.id)}?session=${encodeURIComponent(sessionId)}${regionParam}`;
  const age = jobAge(job.publication_date);

  return (
    <div className="match-row-wrap">
      <Link
        href={href}
        className="match-row"
        aria-label={`${jobTitle(job)} hos ${employerName(job)}${hiddenTrigger ? ` — döljs av gräns: ${hiddenTrigger}` : ""}${age ? `, publicerad ${age}` : ""}`}
      >
        <span className="match-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <span className="match-body">
          <span className="match-title">{jobTitle(job)}</span>
          <span className="match-meta">
            {employerName(job)}
            {jobLocation(job) && ` · ${jobLocation(job)}`}
            {age && <span className="match-age"> · {age}</span>}
            {hiddenTrigger && (
              <span className="match-hidden-tag">gräns: {hiddenTrigger}</span>
            )}
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
      {onToggleSave && (
        <button
          type="button"
          className="match-save-btn"
          onClick={() => onToggleSave(job.id)}
          aria-label={isSaved ? `Ta bort ${jobTitle(job)} från sparade` : `Spara ${jobTitle(job)}`}
          aria-pressed={isSaved}
        >
          {isSaved ? "★" : "☆"}
        </button>
      )}
    </div>
  );
}
