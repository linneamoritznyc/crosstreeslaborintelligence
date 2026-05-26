"use client";

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
import { SWEDISH_REGIONS } from "@/components/KompetensVerifiering";
import JobbRad from "@/components/JobbRad";
import IngenMatch from "@/components/IngenMatch";

interface Props {
  sessionId: string;
  totalSkillCount: number;
  initialRegion?: string;
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

function readRegion(sessionId: string, fallback: string): string {
  try {
    return sessionStorage.getItem(`cv:${sessionId}:region`) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Returns the first boundary topic that triggered the filter, or null. */
function matchedBoundary(job: JobHit, topics: string[]): string | null {
  if (topics.length === 0) return null;
  const haystack = [
    jobTitle(job).toLowerCase(),
    job.description?.text?.toLowerCase() ?? "",
    job.occupation?.label?.toLowerCase() ?? "",
  ].join(" ");
  return topics.find((t) => haystack.includes(t)) ?? null;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; jobs: JobWithScore[] }
  | { kind: "unavailable"; retry: () => void }
  | { kind: "error"; status: number; detail: string };

export default function MatchningarLista({ sessionId, totalSkillCount, initialRegion = "06" }: Props) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [boundaries, setBoundaries] = useState<Boundaries>({ mutedSkills: [], mutedTopics: [] });
  const [region, setRegion] = useState(initialRegion);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    setBoundaries(readBoundaries(sessionId));
    setRegion(readRegion(sessionId, initialRegion));
  }, [sessionId, initialRegion]);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const jobs = await getMatchedJobs(sessionId, region);
      const enriched = await Promise.all(
        jobs.map(async (job): Promise<JobWithScore> => {
          try {
            const s = await getFitScore(sessionId, job.id);
            return { job, score: { value: s.score, low: s.confidence_interval.low, high: s.confidence_interval.high } };
          } catch (err) {
            return { job, score: null, error: err instanceof Error ? err.message : String(err) };
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
  }, [sessionId, region]);

  useEffect(() => { void load(); }, [load]);

  const regionName = SWEDISH_REGIONS.find((r) => r.code === region)?.name ?? region;

  interface FilteredResult {
    visible: JobWithScore[];
    hidden: { item: JobWithScore; trigger: string }[];
    total: number;
  }

  const filtered = useMemo((): FilteredResult | null => {
    if (state.kind !== "ready") return null;
    const visible: JobWithScore[] = [];
    const hidden: { item: JobWithScore; trigger: string }[] = [];
    for (const item of state.jobs) {
      const trigger = matchedBoundary(item.job, boundaries.mutedTopics);
      if (trigger) {
        hidden.push({ item, trigger });
      } else {
        visible.push(item);
      }
    }
    visible.sort((a, b) => (b.score?.value ?? -1) - (a.score?.value ?? -1));
    return { visible, hidden, total: state.jobs.length };
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
            <span className="k">Område</span>
            <span className="v">{regionName}</span>
          </div>
          <div className="context-row">
            <span className="k">Kompetenser</span>
            <span className="v">
              {totalSkillCount - boundaries.mutedSkills.length} används
              {boundaries.mutedSkills.length > 0 && (
                <> · <span className="muted">{boundaries.mutedSkills.length} tystade</span></>
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
            <span className="v">Platsbanken · senaste 20 annonserna</span>
          </div>
        </div>
        <p className="sheet-prose" style={{ marginTop: 8 }}>
          <Link href={`/granska/${sessionId}`}>← Justera kompetenser, region eller gränser</Link>
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
            <em>Söker i Platsbanken och räknar ut hur väl du matchar varje annons…</em>
          </p>
        )}

        {state.kind === "unavailable" && (
          <div className="fail-note">
            <span className="fail-note-head">Vi når inte servern</span>
            Anropet gick aldrig fram. Vi vill inte visa en tom lista som om
            svaret vore noll — då hade vi gett dig fel signal. Försök igen om en stund.
            <div className="empty-options" style={{ marginTop: 14 }}>
              <button type="button" onClick={state.retry}>Försök igen</button>
              <Link href="/">Tillbaka till start</Link>
            </div>
          </div>
        )}

        {state.kind === "error" && (
          <div className="fail-note">
            <span className="fail-note-head">Servern svarade med fel {state.status}</span>
            {state.detail.slice(0, 240) || "Servern sade inte vad som var fel."}
          </div>
        )}

        {filtered && filtered.visible.length === 0 && filtered.total === 0 && (
          <IngenMatch sessionId={sessionId} reason="no-jobs" />
        )}

        {filtered && filtered.visible.length === 0 && filtered.hidden.length > 0 && (
          <IngenMatch sessionId={sessionId} reason="all-filtered" filteredCount={filtered.hidden.length} />
        )}

        {filtered && filtered.visible.length > 0 && (
          <ol className="matches-table">
            {filtered.visible.map((item, i) => (
              <li key={item.job.id} style={{ listStyle: "none" }}>
                <JobbRad index={i} job={item.job} sessionId={sessionId} score={item.score} scoreError={item.error} />
              </li>
            ))}
          </ol>
        )}

        {/* Expandable hidden matches (#5) */}
        {filtered && filtered.hidden.length > 0 && (
          <div className="hidden-matches">
            <button
              type="button"
              className="hidden-matches-toggle"
              onClick={() => setShowHidden((v) => !v)}
              aria-expanded={showHidden}
            >
              <span className="muted">
                {filtered.hidden.length} matchning{filtered.hidden.length !== 1 ? "ar" : ""} döljs av dina gränser
              </span>
              <span className="hidden-matches-arrow">{showHidden ? "↑ Dölj" : "↓ Visa"}</span>
            </button>
            {showHidden && (
              <div className="hidden-matches-panel" aria-label="Dolda matchningar">
                <p className="hidden-matches-note">
                  Dessa annonser matchar dina kompetenser men innehåller ord
                  från dina gränser. De visas här så att du vet att de finns
                  — du bestämmer själv om du vill titta.
                </p>
                <ol className="matches-table" style={{ opacity: 0.6 }}>
                  {filtered.hidden.map(({ item, trigger }, i) => (
                    <li key={item.job.id} style={{ listStyle: "none" }}>
                      <JobbRad
                        index={i}
                        job={item.job}
                        sessionId={sessionId}
                        score={item.score}
                        scoreError={item.error}
                        hiddenTrigger={trigger}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
