"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AIDisclaimer from "@/components/AIDisclaimer";
import SourceTag from "@/components/SourceTag";
import { getApiUrl } from "@/lib/api-client";

interface ConfidenceInterval {
  low: number;
  high: number;
  method: string;
}

interface JobMatch {
  id: string;
  title: string;
  employer: string | null;
  municipality: string | null;
  occupation: string | null;
  published_at: string | null;
  deadline: string | null;
  url: string | null;
  fit_score: number | null;
  confidence_interval: ConfidenceInterval | null;
  matched_skills: string[];
  missing_required: string[];
  missing_preferred: string[];
  data_status: "ok" | "ingen_kompetensdata";
}

interface Props {
  sessionId: string;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("sv-SE");
  } catch {
    return iso;
  }
}

function ScoreBadge({ job }: { job: JobMatch }) {
  if (job.fit_score === null) {
    return (
      <div className="fit-score-badge" aria-label="Fit Score saknas">
        <span className="pill">data saknas</span>
      </div>
    );
  }
  return (
    <div className="fit-score-badge" aria-label={`Fit Score ${job.fit_score} procent`}>
      <span className="fit-score-value">{Math.round(job.fit_score)}%</span>
      {job.confidence_interval && (
        <span className="fit-score-ci">
          95% KI: {Math.round(job.confidence_interval.low)}–
          {Math.round(job.confidence_interval.high)}%
        </span>
      )}
    </div>
  );
}

function ScoreBar({ job }: { job: JobMatch }) {
  if (job.fit_score === null) return null;
  return (
    <div
      className="fit-score-bar"
      role="meter"
      aria-valuenow={job.fit_score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="fit-score-bar-fill" style={{ width: `${job.fit_score}%` }} />
      {job.confidence_interval && (
        <div
          className="fit-score-bar-ci"
          style={{
            left: `${job.confidence_interval.low}%`,
            width: `${
              job.confidence_interval.high - job.confidence_interval.low
            }%`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function JobbLista({ sessionId }: Props) {
  const [jobs, setJobs] = useState<JobMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${getApiUrl()}/match/jobs?session=${sessionId}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`API-fel ${res.status}`);
        const data: JobMatch[] = await res.json();
        setJobs(data);
        setFetchedAt(new Date().toISOString());
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Okänt fel");
      }
    })();
    return () => controller.abort();
  }, [sessionId]);

  if (error) {
    return (
      <div className="empty-state" role="alert">
        <h3>Kunde inte hämta jobb</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (jobs === null) {
    return (
      <div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="loading-skeleton"
            style={{ height: 140, marginBottom: "var(--space-md)" }}
          />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <h3>Inga matchningar hittades</h3>
        <p>
          Vi hittade inga aktiva annonser som matchar dina kompetenser just nu.
          Försök igen om en stund eller bredda dina kompetenser i ditt CV.
        </p>
      </div>
    );
  }

  return (
    <div>
      {jobs.map((job) => (
        <article key={job.id} className="job-card">
          <div className="job-card-header">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 className="job-title">{job.title}</h3>
              <p className="job-employer">
                {job.employer ?? "Arbetsgivare ej angiven"}
                {job.municipality && ` · ${job.municipality}`}
              </p>
            </div>
            <ScoreBadge job={job} />
          </div>
          <ScoreBar job={job} />

          {(job.matched_skills.length > 0 ||
            job.missing_required.length > 0 ||
            job.missing_preferred.length > 0) && (
            <>
              {job.matched_skills.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <small style={{ color: "var(--color-ink-muted)" }}>
                    Matchade kompetenser
                  </small>
                  <div className="skill-pills">
                    {job.matched_skills.map((s) => (
                      <span key={`m-${s}`} className="skill-pill matched">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.missing_required.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <small style={{ color: "var(--color-ink-muted)" }}>
                    Saknade obligatoriska kompetenser
                  </small>
                  <div className="skill-pills">
                    {job.missing_required.map((s) => (
                      <span key={`r-${s}`} className="skill-pill missing">
                        × {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.missing_preferred.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <small style={{ color: "var(--color-ink-muted)" }}>
                    Meriterande kompetenser du saknar
                  </small>
                  <div className="skill-pills">
                    {job.missing_preferred.map((s) => (
                      <span key={`p-${s}`} className="skill-pill preferred">
                        ◦ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="job-meta">
            {job.published_at && (
              <span className="job-meta-item">
                Publicerad {formatDate(job.published_at)}
              </span>
            )}
            {job.deadline && (
              <span className="job-meta-item">
                Sök senast {formatDate(job.deadline)}
              </span>
            )}
            {job.data_status === "ingen_kompetensdata" && (
              <span className="pill warning">Ingen kompetensdata i annonsen</span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: "var(--space-md)",
              flexWrap: "wrap",
            }}
          >
            <Link href={`/jobb/${job.id}`} className="btn-link secondary">
              Visa annonsdetaljer
            </Link>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-link"
              >
                Sök hos arbetsgivaren ↗
              </a>
            )}
          </div>
        </article>
      ))}
      <SourceTag
        source="AF Platsbanken · TF-IDF + Wilson 95% KI"
        fetchedAt={fetchedAt ?? undefined}
      />
      <AIDisclaimer variant="long" />
    </div>
  );
}
