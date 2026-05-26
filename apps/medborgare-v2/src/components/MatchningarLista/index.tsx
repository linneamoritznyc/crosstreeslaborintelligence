"use client";

/**
 * Lista över matchade jobb. Fetchar /match/jobs + per-jobb /match/score
 * parallellt. Applicerar klientsides-filter baserat på användarens
 * gränser (boundaries) från sessionStorage.
 *
 * Lärdom från antiapathyjobportal: tysta fallbacks är farliga. Här:
 *  - om backenden är onåbar → tydligt meddelande, retry-knapp
 *  - om noll jobb returneras → IngenMatch med konkret förklaring
 *  - om filter tog bort allt → IngenMatch med annan förklaring
 *  - varje rad har Wilson-CI synligt (osäkerhet är aldrig dold)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getMatchedJobs,
  getFitScore,
  ApiError,
  ApiUnavailable,
  jobTitle,
  type JobHit,
} from "@/lib/api";
import JobbRad from "@/components/JobbRad";
import IngenMatch from "@/components/IngenMatch";

interface Props {
  sessionId: string;
  totalSkillCount: number;
}

interface JobWithScore {
  job: JobHit;
  score: { value: number; low: number; high: number } | null;
  error?: string;
}

interface Boundaries {
  mutedSkills: string[];
  mutedTopics: string[];
}

function readBoundaries(sessionId: string): Boundaries {
  try {
    const raw = sessionStorage.getItem(`cv:${sessionId}:boundaries`);
    if (!raw) return { mutedSkills: [], mutedTopics: [] };
    const p = JSON.parse(raw);
    return {
      mutedSkills: Array.isArray(p.mutedSkills) ? p.mutedSkills : [],
      mutedTopics: Array.isArray(p.mutedTopics) ? p.mutedTopics : [],
    };
  } catch {
    return { mutedSkills: [], mutedTopics: [] };
  }
}

function matchesBoundary(job: JobHit, topics: string[]): boolean {
  if (topics.length === 0) return false;
  const haystack = [
    jobTitle(job).toLowerCase(),
    job.description?.text?.toLowerCase() ?? "",
    job.occupation?.label?.toLowerCase() ?? "",
  ].join(" ");
  return topics.some((t) => haystack.includes(t));
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; jobs: JobWithScore[] }
  | { kind: "unavailable"; retry: () => void }
  | { kind: "error"; status: number; detail: string };

export default function MatchningarLista({ sessionId, totalSkillCount }: Props) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [boundaries, setBoundaries] = useState<Boundaries>({
    mutedSkills: [],
    mutedTopics: [],
  });

  useEffect(() => {
    setBoundaries(readBoundaries(sessionId));
  }, [sessionId]);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const jobs = await getMatchedJobs(sessionId);
      // Parallel score fetches; individual failures don't sink the page.
      const enriched = await Promise.all(
        jobs.map(async (job): Promise<JobWithScore> => {
          try {
            const s = await getFitScore(sessionId, job.id);
            return {
              job,
              score: {
                value: s.score,
                low: s.confidence_interval.low,
                high: s.confidence_interval.high,
              },
            };
          } catch (err) {
            return {
              job,
              score: null,
              error: err instanceof Error ? err.message : String(err),
            };
          }
        }),
      );
      setState({ kind: "ready", jobs: enriched });
    } catch (err) {
      if (err instanceof ApiUnavailable) {
        setState({ kind: "unavailable", retry: load });
      } else if (err instanceof ApiError) {
        setState({ kind: "error", status: err.status, detail: err.body });
      } else {
        setState({ kind: "error", status: 0, detail: String(err) });
      }
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (state.kind !== "ready") return null;
    const allowed = state.jobs.filter(
      ({ job }) => !matchesBoundary(job, boundaries.mutedTopics),
    );
    // Sort by score descending; jobs with no score go to end but keep stable order.
    return {
      visible: allowed.sort((a, b) => {
        const av = a.score?.value ?? -1;
        const bv = b.score?.value ?? -1;
        return bv - av;
      }),
      total: state.jobs.length,
      filteredOut: state.jobs.length - allowed.length,
    };
  }, [state, boundaries]);

  return (
    <>
      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Sökkontext</span>
          <span className="step-num">vad vi söker</span>
        </h2>
        <div className="context-strip">
          <div className="context-row">
            <span className="k">Region</span>
            <span className="v">Jönköpings län (06) · fast i v2</span>
          </div>
          <div className="context-row">
            <span className="k">Kompetenser</span>
            <span className="v">
              {totalSkillCount - boundaries.mutedSkills.length} aktiva
              {boundaries.mutedSkills.length > 0 && (
                <>
                  {" "}
                  · <span className="muted">{boundaries.mutedSkills.length} tystade</span>
                </>
              )}
            </span>
          </div>
          {boundaries.mutedTopics.length > 0 && (
            <div className="context-row">
              <span className="k">Gränser</span>
              <span className="v">{boundaries.mutedTopics.join(" · ")}</span>
            </div>
          )}
          <div className="context-row">
            <span className="k">Källa</span>
            <span className="v">AF Platsbanken · live · 20 senaste</span>
          </div>
        </div>
        <p className="sheet-prose" style={{ marginTop: 8 }}>
          <Link href={`/granska/${sessionId}`}>← Justera</Link>
        </p>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Matchningar</span>
          <span className="step-num">
            {filtered ? `${filtered.visible.length} av ${filtered.total}` : "…"}
          </span>
        </h2>

        {state.kind === "loading" && (
          <p className="sheet-prose">
            <em>Söker mot Platsbanken och beräknar matchningspoäng…</em>
          </p>
        )}

        {state.kind === "unavailable" && (
          <div className="fail-note">
            <span className="fail-note-head">Backenden svarar inte</span>
            Matching-API:n på Railway gick inte att nå. Vi har inte
            fabricerat några matchningar — listan är tom för att vi inte
            kunde fråga, inte för att svaret var noll.
            <div className="empty-options" style={{ marginTop: 14 }}>
              <button type="button" onClick={state.retry}>
                Försök igen
              </button>
              <Link href="/">Tillbaka till start</Link>
            </div>
          </div>
        )}

        {state.kind === "error" && (
          <div className="fail-note">
            <span className="fail-note-head">Backenden returnerade fel {state.status}</span>
            {state.detail.slice(0, 240) || "Inget felmeddelande från servern."}
          </div>
        )}

        {filtered && filtered.visible.length === 0 && filtered.total === 0 && (
          <IngenMatch sessionId={sessionId} reason="no-jobs" />
        )}

        {filtered && filtered.visible.length === 0 && filtered.filteredOut > 0 && (
          <IngenMatch
            sessionId={sessionId}
            reason="all-filtered"
            filteredCount={filtered.filteredOut}
          />
        )}

        {filtered && filtered.visible.length > 0 && (
          <>
            <ol className="matches-table">
              {filtered.visible.map((item, i) => (
                <li key={item.job.id} style={{ listStyle: "none" }}>
                  <JobbRad
                    index={i}
                    job={item.job}
                    sessionId={sessionId}
                    score={item.score}
                    scoreError={item.error}
                  />
                </li>
              ))}
            </ol>
            {filtered.filteredOut > 0 && (
              <p className="skill-summary">
                <span className="muted">
                  {filtered.filteredOut} matchningar dolda av dina gränser.
                </span>
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}
