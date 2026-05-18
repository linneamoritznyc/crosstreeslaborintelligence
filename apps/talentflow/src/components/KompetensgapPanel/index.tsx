"use client";

import { useEffect, useState } from "react";
import AIDisclaimer from "@/components/AIDisclaimer";
import SourceTag from "@/components/SourceTag";
import { getApiUrl } from "@/lib/api-client";

interface Gap {
  skill_id: string;
  skill_name: string;
  importance?: number;
  priority?: "hög" | "medel" | "låg";
}

interface Education {
  title: string;
  provider: string;
  url: string;
  start_date?: string | null;
  location?: string | null;
}

interface GapResponse {
  target_occupation: string;
  gaps: Gap[];
  education_suggestions: Education[];
  source: string;
}

interface CareerNode {
  id: string;
  label: string;
  type: string;
}

interface Props {
  sessionId: string;
  targetOccupationId: string | null;
  careerNodes: CareerNode[];
  onChangeTarget: (id: string) => void;
}

function priorityFromImportance(importance: number | undefined): Gap["priority"] {
  if (importance === undefined) return "medel";
  if (importance >= 0.7) return "hög";
  if (importance >= 0.4) return "medel";
  return "låg";
}

function PriorityPill({ priority }: { priority: Gap["priority"] }) {
  if (priority === "hög") return <span className="pill danger">Hög prioritet</span>;
  if (priority === "låg") return <span className="pill success">Låg prioritet</span>;
  return <span className="pill warning">Medel prioritet</span>;
}

export default function KompetensgapPanel({
  sessionId,
  targetOccupationId,
  careerNodes,
  onChangeTarget,
}: Props) {
  const [data, setData] = useState<GapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!targetOccupationId) {
      setData(null);
      return;
    }
    const controller = new AbortController();
    setData(null);
    setError(null);
    (async () => {
      try {
        const res = await fetch(
          `${getApiUrl()}/recommend/gaps?session=${sessionId}&target=${encodeURIComponent(targetOccupationId)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`API-fel ${res.status}`);
        const payload: GapResponse = await res.json();
        setData(payload);
        setFetchedAt(new Date().toISOString());
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Okänt fel");
      }
    })();
    return () => controller.abort();
  }, [sessionId, targetOccupationId]);

  if (!targetOccupationId) {
    return (
      <div className="empty-state">
        <h3>Välj ett målyrke först</h3>
        <p>
          Gå till fliken <strong>Karriärvägar</strong> och klicka på ett yrke i
          grafen för att se vilka kompetenser du behöver utveckla.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: "var(--space-md)",
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="target-select"
          style={{ margin: 0, flexShrink: 0 }}
        >
          Målyrke:
        </label>
        <select
          id="target-select"
          value={targetOccupationId}
          onChange={(e) => onChangeTarget(e.target.value)}
          style={{ maxWidth: 360 }}
        >
          {careerNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="empty-state" role="alert">
          <h3>Kunde inte hämta kompetensgap</h3>
          <p>{error}</p>
        </div>
      )}

      {!error && !data && (
        <div className="loading-skeleton" style={{ height: 220 }} />
      )}

      {data && data.gaps.length === 0 && (
        <div className="empty-state">
          <h3>Inga kompetensgap funna</h3>
          <p>
            Bra nyheter — vi hittade inga obligatoriska kompetenser som saknas
            för <strong>{data.target_occupation}</strong> baserat på ditt CV.
          </p>
        </div>
      )}

      {data && data.gaps.length > 0 && (
        <>
          <p>
            För att jobba som <strong>{data.target_occupation}</strong>{" "}
            rekommenderas du utveckla följande kompetenser:
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {data.gaps.map((gap) => {
              const priority = gap.priority ?? priorityFromImportance(gap.importance);
              return (
                <li
                  key={gap.skill_id}
                  style={{
                    padding: "var(--space-md)",
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border-soft)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "var(--space-md)",
                  }}
                >
                  <strong>{gap.skill_name}</strong>
                  <PriorityPill priority={priority} />
                </li>
              );
            })}
          </ul>

          {data.education_suggestions.length > 0 ? (
            <section style={{ marginTop: "var(--space-xl)" }}>
              <h3>Utbildningar som täcker gapet</h3>
              <p style={{ color: "var(--color-ink-soft)" }}>
                Hämtade från Arbetsförmedlingens JobEd Connect — alla startande
                under nästa termin.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {data.education_suggestions.map((edu, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "var(--space-md)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      marginBottom: 8,
                    }}
                  >
                    <strong style={{ display: "block" }}>{edu.title}</strong>
                    <span
                      style={{
                        color: "var(--color-ink-muted)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {edu.provider}
                      {edu.location && ` · ${edu.location}`}
                      {edu.start_date && ` · startar ${edu.start_date}`}
                    </span>
                    {edu.url && (
                      <div style={{ marginTop: 8 }}>
                        <a
                          href={edu.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link secondary"
                          style={{ fontSize: "0.8125rem", padding: "6px 14px" }}
                        >
                          Visa hos myh.se ↗
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p
              style={{
                marginTop: "var(--space-lg)",
                fontSize: "0.875rem",
                color: "var(--color-ink-muted)",
                fontStyle: "italic",
              }}
            >
              Inga matchande utbildningar i JobEd Connect just nu.
            </p>
          )}

          <SourceTag source={data.source} fetchedAt={fetchedAt ?? undefined} />
          <AIDisclaimer variant="long" />
        </>
      )}
    </div>
  );
}
