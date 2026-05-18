"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { getApiUrl } from "@/lib/api-client";

interface Kommun {
  kommun_kod: string;
  namn: string;
  lat: number;
  lon: number;
  befolkning: number;
  bristindex: number | null;
  antal_annonser: number | null;
  data_status: "ok" | "väntar";
}

interface KartData {
  sektor: string;
  sektor_namn: string;
  lan_namn: string;
  kommuner: Kommun[];
  metadata: {
    geodata_kalla: string;
    befolkningsdata_kalla: string;
    live_data_kallor: string[];
    hamtat_utc: string;
  };
}

interface Props {
  sektor: string;
}

const WIDTH = 640;
const HEIGHT = 480;

export default function LanskartaD3({ sektor }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<KartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Kommun | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch(`${getApiUrl()}/kompetensradet/karta?sektor=${sektor}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Kartdata kunde inte hämtas (${res.status})`);
        }
        const payload: KartData = await res.json();
        setData(payload);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Okänt fel");
      }
    }
    load();
    return () => controller.abort();
  }, [sektor]);

  const projection = useMemo(() => {
    if (!data) return null;
    return d3
      .geoMercator()
      .fitExtent(
        [
          [40, 40],
          [WIDTH - 40, HEIGHT - 40],
        ],
        {
          type: "FeatureCollection",
          features: data.kommuner.map((k) => ({
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: [k.lon, k.lat] },
            properties: {},
          })),
        }
      );
  }, [data]);

  const colorScale = useMemo(() => {
    if (!data) return null;
    const values = data.kommuner
      .map((k) => k.bristindex)
      .filter((v): v is number => typeof v === "number");
    const max = values.length > 0 ? Math.max(...values, 1) : 1;
    return d3.scaleSequential(d3.interpolateOranges).domain([0, max * 1.05]);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !data || !projection || !colorScale) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const populationScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data.kommuner, (k) => k.befolkning) ?? 1])
      .range([6, 38]);

    svg
      .append("rect")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .attr("fill", "#f8fafc")
      .attr("stroke", "#e2e8f0");

    svg
      .append("text")
      .attr("x", 16)
      .attr("y", 24)
      .attr("font-size", 11)
      .attr("fill", "#64748b")
      .text(`${data.lan_namn} · ${data.sektor_namn}`);

    const nodes = svg
      .selectAll<SVGGElement, Kommun>("g.kommun")
      .data(data.kommuner)
      .join("g")
      .attr("class", "kommun")
      .attr("transform", (d) => {
        const p = projection([d.lon, d.lat]);
        return p ? `translate(${p[0]}, ${p[1]})` : "translate(0,0)";
      })
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => setHovered(d))
      .on("mouseleave", () => setHovered(null));

    nodes
      .append("circle")
      .attr("r", (d) => populationScale(d.befolkning))
      .attr("fill", (d) =>
        d.bristindex === null ? "#cbd5e1" : (colorScale(d.bristindex) as string)
      )
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#1f3a5f")
      .attr("stroke-width", 1.25);

    nodes
      .append("text")
      .attr("y", (d) => populationScale(d.befolkning) + 14)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .attr("fill", "#0f1c2e")
      .text((d) => d.namn);

    nodes
      .append("text")
      .attr("y", (d) => populationScale(d.befolkning) + 27)
      .attr("text-anchor", "middle")
      .attr("font-size", 9)
      .attr("fill", "#475569")
      .text((d) =>
        d.bristindex !== null ? `index ${d.bristindex.toFixed(1)}` : "data väntar"
      );
  }, [data, projection, colorScale]);

  if (error) {
    return (
      <div className="card">
        <h2>Kommunkarta</h2>
        <p role="alert">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <h2>Kommunkarta</h2>
        <div className="loading-skeleton" style={{ height: HEIGHT, width: "100%" }} />
      </div>
    );
  }

  const legendStops = colorScale
    ? [0, 0.25, 0.5, 0.75, 1].map((t) => ({
        offset: t,
        color: colorScale((colorScale.domain()[1] as number) * t) as string,
      }))
    : [];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Bristkarta — {data.lan_namn}</h2>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-ink-muted)" }}>
            Sektor: {data.sektor_namn}. Cirkelstorlek = befolkning, färg = bristindex.
          </p>
        </div>
        <span className="pill">13 kommuner</span>
      </div>

      <div style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Bristkarta för ${data.sektor_namn} i ${data.lan_namn}`}
          style={{ width: "100%", height: "auto", maxHeight: 480 }}
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
              maxWidth: 240,
            }}
          >
            <strong>{hovered.namn}</strong>
            <br />
            Befolkning: {hovered.befolkning.toLocaleString("sv-SE")}
            <br />
            Bristindex:{" "}
            {hovered.bristindex !== null ? hovered.bristindex.toFixed(2) : "data saknas"}
            <br />
            {hovered.antal_annonser !== null
              ? `${hovered.antal_annonser} live-annonser`
              : "live-annonser saknas"}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>Lågt</span>
        <svg width={140} height={10} aria-hidden="true">
          <defs>
            <linearGradient id="legend-gradient" x1="0%" x2="100%">
              {legendStops.map((s) => (
                <stop key={s.offset} offset={`${s.offset * 100}%`} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
          <rect width={140} height={10} fill="url(#legend-gradient)" rx={5} />
        </svg>
        <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>Högt bristindex</span>
      </div>

      <p className="source-note">
        Källa: {data.metadata.geodata_kalla} · {data.metadata.befolkningsdata_kalla}
        {data.metadata.live_data_kallor.length > 0 &&
          ` · ${data.metadata.live_data_kallor.join(", ")}`}{" "}
        · hämtat {new Date(data.metadata.hamtat_utc).toLocaleString("sv-SE")}
      </p>
    </div>
  );
}
