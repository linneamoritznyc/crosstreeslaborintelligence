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

const W = 600;
const H = 460;

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
        if (!res.ok) throw new Error(`${res.status}`);
        const rows: KommunData[] = await res.json();
        setData(rows);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setFel("Kartdata under validering — försök igen om en stund.");
      }
    }
    hamta();
    return () => controller.abort();
  }, [sektor]);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3
      .geoMercator()
      .center([14.4, 57.62])
      .scale(13800)
      .translate([W / 2, H / 2]);

    // Nautical graticule — latitude lines with depth marks
    for (let lat = 57.0; lat <= 58.4; lat += 0.2) {
      const pt = projection([14.4, lat]);
      if (!pt) continue;
      const [, y] = pt;
      if (y < 0 || y > H) continue;
      svg.append("line")
        .attr("x1", 0).attr("x2", W).attr("y1", y).attr("y2", y)
        .attr("stroke", "#c4bfb4").attr("stroke-width", 0.4)
        .attr("stroke-dasharray", "3,5");
      svg.append("text")
        .attr("x", 5).attr("y", y - 3)
        .attr("font-family", "Courier Prime, monospace")
        .attr("font-size", "7.5").attr("fill", "rgba(26,26,24,0.35)")
        .text(`${lat.toFixed(1)}°N`);
    }
    for (let lon = 13.2; lon <= 15.8; lon += 0.4) {
      const pt = projection([lon, 57.62]);
      if (!pt) continue;
      const [x] = pt;
      if (x < 0 || x > W) continue;
      svg.append("line")
        .attr("x1", x).attr("x2", x).attr("y1", 0).attr("y2", H)
        .attr("stroke", "#c4bfb4").attr("stroke-width", 0.4)
        .attr("stroke-dasharray", "3,5");
    }

    // Project centroids to pixel space
    const pts = data.map(d => {
      const proj = projection([d.lon, d.lat]);
      return { ...d, px: proj?.[0] ?? 0, py: proj?.[1] ?? 0 };
    });

    // Voronoi (Thiessen) regionalization — fills the full map area
    const delaunay = d3.Delaunay.from(pts, d => d.px, d => d.py);
    const voronoi = delaunay.voronoi([0, 0, W, H]);

    const maxBrist = d3.max(data, d => d.brist_index) ?? 1;
    const fill = d3
      .scaleSequential(t => d3.interpolateRgb("#ede7d8", "#7a2e1a")(t))
      .domain([0, Math.max(maxBrist, 1)]);

    // Choropleth cells
    pts.forEach((d, i) => {
      const cell = voronoi.renderCell(i);
      const g = svg.append("g");
      g.append("path")
        .attr("d", cell)
        .attr("fill", d.brist_index > 0 ? fill(d.brist_index) : "#f5f0e8")
        .attr("stroke", "#1a1a18")
        .attr("stroke-width", 0.6)
        .attr("opacity", 0.88);
      g.append("title")
        .text(`${d.namn}: ${d.antal_annonser} annonser`);
    });

    // Centroid dots, labels and depth marks (à la nautical chart)
    pts.forEach(d => {
      svg.append("circle")
        .attr("cx", d.px).attr("cy", d.py).attr("r", 3)
        .attr("fill", "#1a1a18").attr("opacity", 0.55);

      svg.append("text")
        .attr("x", d.px + 6).attr("y", d.py - 4)
        .attr("font-family", "Courier Prime, monospace")
        .attr("font-size", "8.5").attr("font-weight", "700")
        .attr("fill", "rgba(26,26,24,0.85)")
        .text(d.namn.toUpperCase());

      if (d.antal_annonser > 0) {
        svg.append("text")
          .attr("x", d.px + 6).attr("y", d.py + 9)
          .attr("font-family", "Courier Prime, monospace")
          .attr("font-size", "7.5")
          .attr("fill", "rgba(122,46,26,0.85)")
          .text(`— ${d.antal_annonser}`);
      }
    });

    // Gradient legend (parchment → rust)
    const lx = W - 136, ly = 14, lw = 122, lh = 10;
    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "lg-brist");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#ede7d8");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#7a2e1a");
    svg.append("rect")
      .attr("x", lx).attr("y", ly).attr("width", lw).attr("height", lh)
      .attr("fill", "url(#lg-brist)")
      .attr("stroke", "rgba(26,26,24,0.35)").attr("stroke-width", 0.5);
    svg.append("text")
      .attr("x", lx).attr("y", ly + lh + 10)
      .attr("font-family", "Courier Prime, monospace").attr("font-size", "7.5")
      .attr("fill", "rgba(26,26,24,0.45)").text("LÅGT BRIST");
    svg.append("text")
      .attr("x", lx + lw).attr("y", ly + lh + 10)
      .attr("font-family", "Courier Prime, monospace").attr("font-size", "7.5")
      .attr("fill", "rgba(122,46,26,0.75)").attr("text-anchor", "end")
      .text("HÖGT BRIST");

    // Minimal compass rose
    const cpx = 36, cpy = H - 38;
    ([
      [0, -13, "N"], [13, 0, "Ö"], [0, 13, "S"], [-13, 0, "V"],
    ] as [number, number, string][]).forEach(([dx, dy, lbl]) => {
      svg.append("line")
        .attr("x1", cpx).attr("y1", cpy)
        .attr("x2", cpx + dx).attr("y2", cpy + dy)
        .attr("stroke", "rgba(26,26,24,0.38)").attr("stroke-width", 0.7);
      svg.append("text")
        .attr("x", cpx + dx * 1.8).attr("y", cpy + dy * 1.8 + 3)
        .attr("font-family", "Courier Prime, monospace").attr("font-size", "7")
        .attr("fill", "rgba(26,26,24,0.4)").attr("text-anchor", "middle")
        .text(lbl);
    });
    svg.append("circle")
      .attr("cx", cpx).attr("cy", cpy).attr("r", 2.5)
      .attr("fill", "rgba(26,26,24,0.4)");

  }, [data]);

  return (
    <section aria-label="Länkarta">
      <h2>Bristkarta — Jönköpings län</h2>
      <p className="coord">57°37′N · 14°10′E · Mercator EPSG:3857 · Thiessen-regionalisering</p>
      {fel && (
        <p role="alert" className="body-t" style={{ fontStyle: "italic", marginTop: "0.5rem" }}>
          {fel}
        </p>
      )}
      {!fel && !data && (
        <p className="coord" style={{ marginTop: "1rem" }}>Laddar kartdata…</p>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Bristkarta per kommun i Jönköpings län"
        style={{
          width: "100%",
          maxWidth: `${W}px`,
          height: "auto",
          display: "block",
          marginTop: "0.75rem",
          background: "var(--parchment)",
          border: "0.5px solid rgba(26,26,24,0.4)",
        }}
      />
      <DataLabel
        source="AF Platsbanken · SCB kommuncentroider 2025 · Thiessen-polygoner"
        date={new Date().toLocaleDateString("sv-SE")}
      />
    </section>
  );
}
