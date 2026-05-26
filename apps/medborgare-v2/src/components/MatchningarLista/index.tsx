"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getMatchedJobs,
  getFitScore,
  ApiError,
  ApiUnavailable,
  jobTitle,
  jobAge,
  type JobHit,
  type FitScore,
} from "@/lib/api";
import { SWEDISH_REGIONS } from "@/components/KompetensVerifiering";
import JobbRad from "@/components/JobbRad";
import IngenMatch from "@/components/IngenMatch";
import KarriarGraf from "@/components/KarriarGraf";

interface Props {
  sessionId: string;
  totalSkillCount: number;
  initialRegion?: string;
}

interface JobWithScore {
  job: JobHit;
  score: (FitScore & { low: number; high: number }) | null;
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

function readSaved(sessionId: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(`cv:${sessionId}:saved`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function writeSaved(sessionId: string, ids: Set<string>) {
  try {
    sessionStorage.setItem(`cv:${sessionId}:saved`, JSON.stringify([...ids]));
  } catch { /* ok */ }
}

function matchedBoundary(job: JobHit, topics: string[]): string | null {
  if (topics.length === 0) return null;
  const haystack = [
    jobTitle(job).toLowerCase(),
    job.description?.text?.toLowerCase() ?? "",
    job.occupation?.label?.toLowerCase() ?? "",
  ].join(" ");
  return topics.find((t) => haystack.includes(t)) ?? null;
}

function withinDays(job: JobHit, days: number): boolean {
  if (!job.publication_date) return true;
  const diffMs = Date.now() - new Date(job.publication_date).getTime();
  return diffMs <= days * 86_400_000;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; jobs: JobWithScore[] }
  | { kind: "unavailable"; retry: () => void }
  | { kind: "error"; status: number; detail: string };

type DateFilter = "all" | "7" | "30";

export default function MatchningarLista({ sessionId, totalSkillCount, initialRegion = "06" }: Props) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [boundaries, setBoundaries] = useState<Boundaries>({ mutedSkills: [], mutedTopics: [] });
  const [region, setRegion] = useState(initialRegion);
  const [showHidden, setShowHidden] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showOnlySaved, setShowOnlySaved] = useState(false);

  useEffect(() => {
    setBoundaries(readBoundaries(sessionId));
    setRegion(readRegion(sessionId, initialRegion));
    setSavedIds(readSaved(sessionId));
  }, [sessionId, initialRegion]);

  const toggleSave = useCallback((jobId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      writeSaved(sessionId, next);
      return next;
    });
  }, [sessionId]);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const jobs = await getMatchedJobs(sessionId, region);
      const enriched = await Promise.all(
        jobs.map(async (job): Promise<JobWithScore> => {
          try {
            const s = await getFitScore(sessionId, job.id);
            return {
              job,
              score: {
                ...s,
                low: s.confidence_interval.low,
                high: s.confidence_interval.high,
              },
            };
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

  const filtered = useMemo(() => {
    if (state.kind !== "ready") return null;
    const visible: JobWithScore[] = [];
    const hidden: { item: JobWithScore; trigger: string }[] = [];

    for (const item of state.jobs) {
      const trigger = matchedBoundary(item.job, boundaries.mutedTopics);
      const passesDate = dateFilter === "all" || withinDays(item.job, Number(dateFilter));
      const passesSaved = !showOnlySaved || savedIds.has(item.job.id);

      if (trigger) {
        hidden.push({ item, trigger });
      } else if (passesDate && passesSaved) {
        visible.push(item);
      }
    }
    visible.sort((a, b) => (b.score?.score ?? -1) - (a.score?.score ?? -1));
    return { visible, hidden, total: state.jobs.length };
  }, [state, boundaries, dateFilter, showOnlySaved, savedIds]);

  // #2 Kompetensfrekvens — count how often each matched skill appears
  const skillFrequency = useMemo(() => {
    if (state.kind !== "ready") return [];
    const freq: Record<string, number> = {};
    for (const { score } of state.jobs) {
      if (!score) continue;
      for (const s of score.matched_required) {
        freq[s] = (freq[s] ?? 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [state]);

  // #3 Kompetensglapp-syntes — most common missing skills across all jobs
  const gapSynthesis = useMemo(() => {
    if (state.kind !== "ready") return [];
    const gaps: Record<string, number> = {};
    for (const { score } of state.jobs) {
      if (!score) continue;
      for (const s of score.missing_required) {
        gaps[s] = (gaps[s] ?? 0) + 1;
      }
    }
    return Object.entries(gaps)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [state]);

  const allJobs = state.kind === "ready" ? state.jobs.map((j) => j.job) : [];

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

      {/* #2 Kompetensfrekvens */}
      {skillFrequency.length > 0 && (
        <section className="sheet-section">
          <h2 className="sheet-section-head">
            <span>Dina mest efterfrågade kompetenser</span>
            <span className="step-num">frekvens</span>
          </h2>
          <p className="sheet-prose">
            Hur många av annonserna efterfrågar var och en av dina kompetenser.
            Det här är vad arbetsgivarna i {regionName} faktiskt söker hos dig just nu.
          </p>
          <ol className="freq-list">
            {skillFrequency.map(([skill, count]) => (
              <li key={skill} className="freq-row">
                <span className="freq-label">{skill}</span>
                <span className="freq-bar-wrap">
                  <span
                    className="freq-bar-fill"
                    style={{ width: `${Math.round((count / (filtered?.total ?? 1)) * 100)}%` }}
                  />
                </span>
                <span className="freq-count">{count} av {filtered?.total ?? "?"}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* #3 Kompetensglapp-syntes */}
      {gapSynthesis.length > 0 && (
        <section className="sheet-section">
          <h2 className="sheet-section-head">
            <span>Vanligaste kompetensglapp</span>
            <span className="step-num">glapp</span>
          </h2>
          <p className="sheet-prose">
            Dessa kompetenser saknas oftast i ditt CV jämfört med annonsernas krav.
            Att lägga till dem skulle höja din matchningspoäng i flest annonser.
          </p>
          <ol className="gap-list">
            {gapSynthesis.map(([skill, count]) => (
              <li key={skill} className="gap-row">
                <span className="gap-label">{skill}</span>
                <span className="gap-count">saknas i {count} annons{count !== 1 ? "er" : ""}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* #4 Karriärgrafvy */}
      {state.kind === "ready" && (
        <section className="sheet-section">
          <h2 className="sheet-section-head">
            <span>Var kan du gå härifrån?</span>
            <span className="step-num">karriär</span>
          </h2>
          <KarriarGraf sessionId={sessionId} matchedJobs={allJobs} />
        </section>
      )}

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Matchningar</span>
          <span className="step-num">
            {filtered ? `${filtered.visible.length} av ${filtered.total}` : "…"}
          </span>
        </h2>

        {/* #6 Datum-filter + #5 Sparade-filter + #7 Skriv ut */}
        {state.kind === "ready" && (
          <div className="match-controls" aria-label="Filtrera matchningar">
            <div className="match-filters">
              <fieldset className="date-filter">
                <legend>Publiceringsdatum</legend>
                {(["all", "7", "30"] as DateFilter[]).map((v) => (
                  <label key={v} className="date-filter-opt">
                    <input
                      type="radio"
                      name="date-filter"
                      value={v}
                      checked={dateFilter === v}
                      onChange={() => setDateFilter(v)}
                    />
                    {v === "all" ? "Alla" : v === "7" ? "Senaste 7 dagar" : "Senaste 30 dagar"}
                  </label>
                ))}
              </fieldset>
              {savedIds.size > 0 && (
                <label className="saved-filter">
                  <input
                    type="checkbox"
                    checked={showOnlySaved}
                    onChange={(e) => setShowOnlySaved(e.target.checked)}
                  />
                  Visa bara sparade ({savedIds.size})
                </label>
              )}
            </div>
            <button
              type="button"
              className="print-btn"
              onClick={() => window.print()}
              aria-label="Skriv ut matchningsrapporten"
            >
              Skriv ut rapport
            </button>
          </div>
        )}

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
                <JobbRad
                  index={i}
                  job={item.job}
                  sessionId={sessionId}
                  region={region}
                  score={item.score ? { value: item.score.score, low: item.score.low, high: item.score.high } : null}
                  scoreError={item.error}
                  isSaved={savedIds.has(item.job.id)}
                  onToggleSave={toggleSave}
                />
              </li>
            ))}
          </ol>
        )}

        {/* Expandable hidden matches */}
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
                        region={region}
                        score={item.score ? { value: item.score.score, low: item.score.low, high: item.score.high } : null}
                        scoreError={item.error}
                        hiddenTrigger={trigger}
                        isSaved={savedIds.has(item.job.id)}
                        onToggleSave={toggleSave}
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
