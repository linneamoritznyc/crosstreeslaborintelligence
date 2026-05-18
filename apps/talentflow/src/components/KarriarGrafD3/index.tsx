"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import AIDisclaimer from "@/components/AIDisclaimer";
import SourceTag from "@/components/SourceTag";
import { getApiUrl } from "@/lib/api-client";

interface CareerNode {
  id: string;
  label: string;
  type: "current" | "adjacent" | "target";
  score?: number;
  live_jobs?: number | null;
}

interface CareerEdge {
  from: string;
  to: string;
  score: number;
}

interface CareerGraph {
  nodes: CareerNode[];
  edges: CareerEdge[];
  source: string;
}

interface Props {
  sessionId: string;
  selectedTarget: string | null;
  onSelectTarget: (id: string) => void;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "current" | "adjacent" | "target";
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  score: number;
}

const WIDTH = 720;
const HEIGHT = 480;

function colorForType(type: string, isSelected: boolean): string {
  if (isSelected) return "#0a6d6d";
  if (type === "current") return "#0f8585";
  if (type === "target") return "#16a34a";
  return "#94a3b8";
}

export default function KarriarGrafD3({
  sessionId,
  selectedTarget,
  onSelectTarget,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [graph, setGraph] = useState<CareerGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<CareerNode | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `${getApiUrl()}/recommend/career-graph?session=${sessionId}`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`API-fel ${res.status}`);
        const data: CareerGraph = await res.json();
        setGraph(data);
        setFetchedAt(new Date().toISOString());
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Okänt fel");
      }
    })();
    return () => controller.abort();
  }, [sessionId]);

  useEffect(() => {
    if (!svgRef.current || !graph) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (graph.nodes.length === 0) return;

    const nodes: SimNode[] = graph.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
    }));

    const links: SimLink[] = graph.edges
      .filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to))
      .map((e) => ({
        source: e.from,
        target: e.to,
        score: e.score,
      }));

    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(120)
          .strength((d) => Math.max(0.2, d.score * 0.8))
      )
      .force("charge", d3.forceManyBody<SimNode>().strength(-300))
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", d3.forceCollide<SimNode>().radius(40));

    const link = svg
      .append("g")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.max(1, d.score * 4));

    const node = svg
      .append("g")
      .selectAll<SVGGElement, SimNode>("g.node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", (d) => (d.type === "current" ? "default" : "pointer"))
      .on("mouseenter", (_, d) => {
        const original = graph.nodes.find((n) => n.id === d.id) ?? null;
        setHovered(original);
      })
      .on("mouseleave", () => setHovered(null))
      .on("click", (_, d) => {
        if (d.type !== "current") onSelectTarget(d.id);
      });

    node
      .append("circle")
      .attr("r", (d) => (d.type === "current" ? 30 : 22))
      .attr("fill", (d) => colorForType(d.type, d.id === selectedTarget))
      .attr("stroke", (d) =>
        d.id === selectedTarget ? "#0a6d6d" : d.type === "current" ? "#0f8585" : "white"
      )
      .attr("stroke-width", (d) => (d.id === selectedTarget ? 4 : 2));

    node
      .append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.type === "current" ? 46 : 38))
      .attr("font-size", 12)
      .attr("font-weight", (d) => (d.type === "current" ? 600 : 500))
      .attr("fill", "#0f1c2e");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);
      node.attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    return () => {
      simulation.stop();
    };
  }, [graph, selectedTarget, onSelectTarget]);

  if (error) {
    return (
      <div className="empty-state" role="alert">
        <h3>Kunde inte hämta karriärgrafen</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!graph) {
    return <div className="loading-skeleton" style={{ height: HEIGHT }} />;
  }

  if (graph.nodes.length === 0) {
    return (
      <div className="empty-state">
        <h3>Inga karriärvägar hittades</h3>
        <p>
          Vi kunde inte beräkna övergångar utifrån ditt CV just nu. Graf-datat
          uppdateras veckovis från AF substitutabilitetsdataset.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="career-graph-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Interaktiv karriärgraf"
          style={{ width: "100%", height: "auto", maxHeight: HEIGHT, display: "block" }}
        />
        {hovered && (
          <div
            role="status"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(15, 28, 46, 0.92)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              maxWidth: 260,
              pointerEvents: "none",
            }}
          >
            <strong>{hovered.label}</strong>
            <br />
            {hovered.type === "current"
              ? "Detta är ditt nuvarande/närmaste yrke."
              : "Klicka för att se kompetensgap för detta yrke."}
          </div>
        )}
      </div>

      <div className="career-graph-legend">
        <span>
          <span
            className="swatch"
            style={{ background: "#0f8585" }}
            aria-hidden="true"
          />
          Nuvarande yrke
        </span>
        <span>
          <span
            className="swatch"
            style={{ background: "#94a3b8" }}
            aria-hidden="true"
          />
          Möjlig övergång
        </span>
        <span>
          <span
            className="swatch"
            style={{ background: "#0a6d6d" }}
            aria-hidden="true"
          />
          Vald som mål
        </span>
        <span style={{ marginLeft: "auto" }}>
          Klicka eller dra noder · {graph.nodes.length} yrken,{" "}
          {graph.edges.length} övergångar
        </span>
      </div>

      <SourceTag source={graph.source} fetchedAt={fetchedAt ?? undefined} />
      <AIDisclaimer variant="long">
        <span>
          Karriärgrafen är en sammanställning av övergångar som andra med
          liknande kompetenser har gjort. Det är ingen prognos om vad som
          passar just dig — använd den som inspiration och prata med en
          karriärrådgivare innan du fattar beslut.
        </span>
      </AIDisclaimer>
    </div>
  );
}
