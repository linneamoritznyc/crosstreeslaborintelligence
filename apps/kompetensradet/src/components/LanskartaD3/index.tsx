"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import DataLabel from "@/components/DataLabel";

interface KommunData {
  kommun_kod: string;
  namn: string;
  lon: number;
  lat: number;
  brist_index: number;
  antal_annonser: number;
}

interface Props {
  sektor: string;
}

export default function LanskartaD3({ sektor }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<KommunData[] | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function hamta() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kompetensradet/karta?sektor=${sektor}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Karta kunde inte laddas (${res.status})`);
        const rows: KommunData[] = await res.json();
        setData(rows);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setFel("Grafdata under validering — försök igen om en stund.");
      }
    }
    hamta();
    return () => controller.abort();
  }, [sektor]);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 480;
    const projection = d3
      .geoMercator()
      .center([14.5, 57.65])
      .scale(14000)
      .translate([width / 2, height / 2]);

    const maxBrist = d3.max(data, (d) => d.brist_index) ?? 1;
    const colorScale = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, Math.max(maxBrist, 1)]);

    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => projection([d.lon, d.lat])?.[0] ?? 0)
      .attr("cy", (d) => projection([d.lon, d.lat])?.[1] ?? 0)
      .attr("r", (d) => 8 + Math.sqrt(d.brist_index) * 2)
      .attr("fill", (d) => colorScale(d.brist_index))
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("opacity", 0.85)
      .append("title")
      .text((d) => `${d.namn}: ${d.antal_annonser} annonser`);

    svg
      .selectAll("text.kommun")
      .data(data)
      .join("text")
      .attr("class", "kommun")
      .attr("x", (d) => (projection([d.lon, d.lat])?.[0] ?? 0) + 12)
      .attr("y", (d) => (projection([d.lon, d.lat])?.[1] ?? 0) + 4)
      .attr("font-size", "11px")
      .attr("fill", "#222")
      .text((d) => d.namn);
  }, [data]);

  return (
    <section aria-label="Länkarta">
      <h2>Bristkarta — Jönköpings län</h2>
      {fel && <p role="alert">{fel}</p>}
      {!fel && !data && <p>Laddar kartdata…</p>}
      {data && data.every((d) => d.antal_annonser === 0) && (
        <p>
          <em>Inga aktuella annonser hittades för denna sektor i Jönköpings län.</em>
        </p>
      )}
      <svg
        ref={svgRef}
        width={600}
        height={480}
        role="img"
        aria-label="Bristkarta per kommun i Jönköpings län"
        style={{ background: "#f8f9fb", border: "1px solid #e0e0e0" }}
      />
      <DataLabel
        source="SCB Geodata 2025 (kommungränser) + AF Platsbanken (annonsräkning)"
        date={new Date().toLocaleDateString("sv-SE")}
      />
    </section>
  );
}
