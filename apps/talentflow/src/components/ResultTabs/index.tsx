"use client";

import { useState, useEffect, type ReactNode } from "react";
import JobbLista from "@/components/JobbLista";
import KarriarGrafD3 from "@/components/KarriarGrafD3";
import KompetensgapPanel from "@/components/KompetensgapPanel";
import { getApiUrl } from "@/lib/api-client";

interface Props {
  sessionId: string;
}

type TabId = "jobb" | "karriar" | "gap";

interface JobSummary {
  id: string;
  fit_score: number | null;
}

interface CareerNode {
  id: string;
  label: string;
  type: string;
}

export default function ResultTabs({ sessionId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("jobb");
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [careerNodes, setCareerNodes] = useState<CareerNode[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const [jobsRes, graphRes] = await Promise.all([
          fetch(`${getApiUrl()}/match/jobs?session=${sessionId}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch(`${getApiUrl()}/recommend/career-graph?session=${sessionId}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);
        if (jobsRes.ok) {
          const jobs: JobSummary[] = await jobsRes.json();
          setJobCount(jobs.length);
        } else {
          setJobCount(0);
        }
        if (graphRes.ok) {
          const graph: { nodes: CareerNode[] } = await graphRes.json();
          const adjacent = (graph.nodes ?? []).filter(
            (n) => n.type !== "current"
          );
          setCareerNodes(adjacent);
          if (adjacent.length > 0) setSelectedTarget(adjacent[0].id);
        }
      } catch {
        /* räknarna är frivilliga */
      }
    })();
    return () => controller.abort();
  }, [sessionId]);

  const tabs: Array<{ id: TabId; label: string; count?: number; description: string }> = [
    {
      id: "jobb",
      label: "Matchande jobb",
      count: jobCount ?? undefined,
      description: "Live från Platsbanken, rankade efter Fit Score.",
    },
    {
      id: "karriar",
      label: "Karriärvägar",
      count: careerNodes.length || undefined,
      description: "Beräknat via Personalized PageRank.",
    },
    {
      id: "gap",
      label: "Kompetensgap",
      description: "Saknade kompetenser och utbildningar som täcker dem.",
    },
  ];

  const activeMeta = tabs.find((t) => t.id === activeTab)!;

  let content: ReactNode = null;
  if (activeTab === "jobb") {
    content = <JobbLista sessionId={sessionId} />;
  } else if (activeTab === "karriar") {
    content = (
      <KarriarGrafD3
        sessionId={sessionId}
        selectedTarget={selectedTarget}
        onSelectTarget={(id) => {
          setSelectedTarget(id);
          setActiveTab("gap");
        }}
      />
    );
  } else if (activeTab === "gap") {
    content = (
      <KompetensgapPanel
        sessionId={sessionId}
        targetOccupationId={selectedTarget}
        careerNodes={careerNodes}
        onChangeTarget={setSelectedTarget}
      />
    );
  }

  return (
    <section className="card">
      <div role="tablist" aria-label="Resultatflikar" className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
      <p style={{ color: "var(--color-ink-muted)", fontSize: "0.875rem", marginBottom: "var(--space-md)" }}>
        {activeMeta.description}
      </p>
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {content}
      </div>
    </section>
  );
}
