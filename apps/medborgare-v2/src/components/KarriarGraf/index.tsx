"use client";

import { useEffect, useState } from "react";
import { getCareerGraph, type CareerGraph, type JobHit, jobTitle } from "@/lib/api";

interface Props {
  sessionId: string;
  /** Matched jobs — used as fallback when Neo4j isn't available */
  matchedJobs: JobHit[];
}

type State =
  | { kind: "loading" }
  | { kind: "graph"; data: CareerGraph }
  | { kind: "fallback" }
  | { kind: "error" };

export default function KarriarGraf({ sessionId, matchedJobs }: Props) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    getCareerGraph(sessionId)
      .then((data) => {
        if (data.unavailable || data.nodes.length === 0) {
          setState({ kind: "fallback" });
        } else {
          setState({ kind: "graph", data });
        }
      })
      .catch(() => setState({ kind: "fallback" }));
  }, [sessionId]);

  // Derive occupation frequency from matched jobs for the fallback view
  const occupationFreq = matchedJobs.reduce<Record<string, number>>((acc, job) => {
    const label = job.occupation?.label;
    if (label) acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const topOccupations = Object.entries(occupationFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (state.kind === "loading") {
    return (
      <p className="sheet-prose">
        <em>Beräknar karriärövergångar…</em>
      </p>
    );
  }

  if (state.kind === "graph") {
    const adj = state.data.nodes.filter((n) => n.type === "adjacent");
    if (adj.length === 0) return null;
    return (
      <div className="karriar-list">
        <p className="karriar-intro">
          Baserat på kompetenser som liknar dina matchar systemet dessa yrkesroller
          som möjliga nästa steg.
        </p>
        <ol className="karriar-nodes">
          {adj.map((node) => {
            const edge = state.data.edges.find((e) => e.to === node.id);
            return (
              <li key={node.id} className="karriar-node">
                <span className="karriar-node-label">{node.label}</span>
                {edge?.score != null && (
                  <span className="karriar-node-score">
                    likhet {Math.round(edge.score * 100)}%
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  // Fallback: occupation distribution from matched jobs
  if (topOccupations.length === 0) return null;

  return (
    <div className="karriar-list">
      <p className="karriar-intro">
        Dina matchningar fördelas över dessa yrkesområden — de visar var dina
        kompetenser är mest efterfrågade just nu.
      </p>
      <ol className="karriar-nodes">
        {topOccupations.map(([label, count]) => (
          <li key={label} className="karriar-node">
            <span className="karriar-node-label">{label}</span>
            <span className="karriar-node-score">
              {count} annons{count !== 1 ? "er" : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="karriar-note">
        Karriärgrafen med grannskapsavstånd kräver yrkesdatabasen — den
        visas när den är laddad.
      </p>
    </div>
  );
}
