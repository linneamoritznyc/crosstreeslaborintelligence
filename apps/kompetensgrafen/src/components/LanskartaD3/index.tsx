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
          `${process.env.NEXT_PUBLIC_API_URL}/kompetensgrafen/karta?sektor=${sektor}`,
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

    // Chart grid background — latitude/longitude graticule
    const graticuleColor = "#d8cfb8";
    for (let lat = 57.0; lat <= 58.5; lat += 0.25) {
      const y = projection([14.5, lat])?.[1];
      if (y !== undefined) {
        svg
          .append("line")
          .attr("x1", 0).attr("x2", width)
          .attr("y1", y).attr("y2", y)
          .attr("stroke", graticuleColor)
          .attr("stroke-width", 0.5);
      }
    }
    for (let lon = 13.0; lon <= 16.0; lon += 0.5) {
      const x = projection([lon, 57.65])?.[0];
      if (x !== undefined) {
        svg
          .append("line")
          .attr("y1", 0).attr("y2", height)
          .attr("x1", x).attr("x2", x)
          .attr("stroke", graticuleColor)
          .attr("stroke-width", 0.5);
      }
    }

    const maxBrist = d3.max(data, (d) => d.brist_index) ?? 1;
    const colorScale = d3
      .scaleSequential((t) => d3.interpolateRgb("#f5f0e8", "#7a2e1a")(t))
      .domain([0, Math.max(maxBrist, 1)]);

    const g = svg.append("g");

    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => projection([d.lon, d.lat])?.[0] ?? 0)
      .attr("cy", (d) => projection([d.lon, d.lat])?.[1] ?? 0)
      .attr("r", (d) => 10 + Math.sqrt(d.brist_index) * 2.5)
      .attr("fill", (d) => colorScale(d.brist_index))
      .attr("stroke", "#1a1a18")
      .attr("stroke-width", 1)
      .attr("opacity", 0.85)
      .append("title")
      .text((d) => `${d.namn}: ${d.antal_annonser} annonser`);

    g.selectAll("text.kommun")
      .data(data)
      .join("text")
      .attr("class", "kommun")
      .attr("x", (d) => (projection([d.lon, d.lat])?.[0] ?? 0) + 14)
      .attr("y", (d) => (projection([d.lon, d.lat])?.[1] ?? 0) + 4)
      .attr("font-family", "Courier Prime, monospace")
      .attr("font-size", "10px")
      .attr("fill", "#1a1a18")
      .text((d) => d.namn.toUpperCase());
  }, [data]);

  return (
    <section aria-label="Länkarta">
      <h2>Bristkarta — Jönköpings län</h2>
      <p className="coord">57°24&prime;N · 15°04&prime;E — projektion EPSG:3857</p>
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
        style={{
          background: "var(--parchment)",
          border: "1px solid var(--ink)",
          maxWidth: "100%",
          height: "auto",
        }}
      />
      <DataLabel
        source="SCB Geodata RegSO 2025 + AF Platsbanken"
        date={new Date().toLocaleDateString("sv-SE")}
      />
    </section>
  );
}
