"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface KommunData {
  kommun_kod: string;
  namn: string;
  lon: number;
  lat: number;
  brist_index: number;
  antal_annonser: number;
}

const W = 600, H = 460;
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function Bristkarta({ sektor }: { sektor: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<KommunData[] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("sv-SE");

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/kompetensgrafen/karta?sektor=${sektor}`, { signal: ac.signal })
      .then(r => r.json()).then(setData).catch(() => {});
    return () => ac.abort();
  }, [sektor]);

  useEffect(() => {
    if (!svgRef.current || !data || !data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const proj = d3.geoMercator().center([14.5, 57.62]).scale(13800).translate([W / 2, H / 2]);

    for (let lat = 57.0; lat <= 58.4; lat += 0.2) {
      const pt = proj([14.5, lat]);
      if (!pt) continue;
      const [, y] = pt;
      if (y < 0 || y > H) continue;
      svg.append("line").attr("x1", 0).attr("x2", W).attr("y1", y).attr("y2", y)
        .attr("stroke", "#c4bfb4").attr("stroke-width", 0.4).attr("stroke-dasharray", "3,5");
      svg.append("text").attr("x", 5).attr("y", y - 3)
        .attr("font-family", "Courier Prime, monospace").attr("font-size", "7.5")
        .attr("fill", "rgba(26,26,24,0.35)").text(`${lat.toFixed(1)}°N`);
    }

    const pts = data.map(d => {
      const p = proj([d.lon, d.lat]);
      return { ...d, px: p?.[0] ?? 0, py: p?.[1] ?? 0 };
    });

    const maxBrist = Math.max(...data.map(d => d.brist_index), 1);
    const delaunay = d3.Delaunay.from(pts, d => d.px, d => d.py);
    const voronoi = delaunay.voronoi([0, 0, W, H]);

    const contours = [
      "M-40 120 Q 200 90 400 140 T 640 110",
      "M-40 240 Q 220 210 420 260 T 640 230",
      "M-40 360 Q 200 330 400 380 T 640 350",
    ];
    contours.forEach(d => svg.append("path").attr("d", d).attr("fill", "none")
      .attr("stroke", "rgba(26,26,24,0.10)").attr("stroke-width", 0.6));

    pts.forEach((d, i) => {
      const cell = voronoi.renderCell(i);
      const intensity = d.brist_index / maxBrist;
      const g = svg.append("g").style("cursor", "default")
        .on("mouseover", function () {
          d3.select(this).select(".cell-base").attr("stroke", "#7A2E1A").attr("stroke-width", 1.5);
          setHovered(`${d.namn}: ${d.antal_annonser} öppna annonser`);
        })
        .on("mouseout", function () {
          d3.select(this).select(".cell-base").attr("stroke", "rgba(26,26,24,0.4)").attr("stroke-width", 0.5);
          setHovered(null);
        });
      g.append("path").attr("d", cell).attr("class", "cell-base")
        .attr("fill", "#F5F0E8").attr("stroke", "rgba(26,26,24,0.4)").attr("stroke-width", 0.5);
      if (intensity > 0.05) {
        g.append("path").attr("d", cell)
          .attr("fill", `rgba(122,46,26,${(0.15 + intensity * 0.7).toFixed(2)})`).attr("stroke", "none");
      }
    });

    pts.forEach(d => {
      svg.append("text").attr("x", d.px).attr("y", d.py - 2).attr("text-anchor", "middle")
        .attr("font-family", "Courier Prime, monospace").attr("font-size", "8")
        .attr("font-weight", "700").attr("fill", "rgba(26,26,24,0.8)").attr("letter-spacing", "0.05em")
        .attr("pointer-events", "none").text(d.namn.toUpperCase());
      if (d.antal_annonser > 0) {
        svg.append("text").attr("x", d.px).attr("y", d.py + 11).attr("text-anchor", "middle")
          .attr("font-family", "Courier Prime, monospace").attr("font-size", "7")
          .attr("fill", "rgba(122,46,26,0.85)").attr("pointer-events", "none")
          .text(`— ${d.antal_annonser}`);
      }
    });

    const cpx = 36, cpy = H - 38;
    ([[0, -13, "N"], [13, 0, "Ö"], [0, 13, "S"], [-13, 0, "V"]] as [number, number, string][])
      .forEach(([dx, dy, lbl]) => {
        svg.append("line").attr("x1", cpx).attr("y1", cpy).attr("x2", cpx + dx).attr("y2", cpy + dy)
          .attr("stroke", "rgba(26,26,24,0.38)").attr("stroke-width", 0.7);
        svg.append("text").attr("x", cpx + dx * 1.8).attr("y", cpy + dy * 1.8 + 3)
          .attr("font-family", "Courier Prime, monospace").attr("font-size", "7")
          .attr("fill", "rgba(26,26,24,0.4)").attr("text-anchor", "middle").text(lbl);
      });
    svg.append("circle").attr("cx", cpx).attr("cy", cpy).attr("r", 2.5).attr("fill", "rgba(26,26,24,0.4)");

    const defs = svg.append("defs");
    const lg = defs.append("linearGradient").attr("id", "brist-grad");
    lg.append("stop").attr("offset", "0%").attr("stop-color", "rgba(122,46,26,0.15)");
    lg.append("stop").attr("offset", "100%").attr("stop-color", "rgba(122,46,26,0.85)");
    svg.append("rect").attr("x", W - 210).attr("y", 14).attr("width", 200).attr("height", 4)
      .attr("fill", "url(#brist-grad)");
    svg.append("text").attr("x", W - 210).attr("y", 27).attr("font-family", "Courier Prime, monospace")
      .attr("font-size", "7.5").attr("fill", "rgba(26,26,24,0.45)").text("BRIST · LÅG");
    svg.append("text").attr("x", W - 10).attr("y", 27).attr("font-family", "Courier Prime, monospace")
      .attr("font-size", "7.5").attr("fill", "rgba(122,46,26,0.75)").attr("text-anchor", "end").text("HÖG");
  }, [data, sektor]);

  return (
    <section className="analys-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p className="rust-eyebrow">STEG 2 · BRISTKARTA · JÖNKÖPINGS LÄN</p>
          <h2 className="analys-h2">BRISTKARTA</h2>
          <p className="analys-subhead">
            Mättnad i rust visar bristens allvarlighetsgrad per kommun. Sväva över en kommun för detaljer.
          </p>
        </div>
        <span className="coord" style={{ whiteSpace: "nowrap", marginTop: 4 }}>57°24′N · 15°04′E · EPSG:3857</span>
      </div>
      <div style={{ position: "relative", border: "0.5px solid rgba(26,26,24,0.4)", marginTop: 24,
        background: "var(--parchment)" }}>
        {!data && <p className="coord" style={{ padding: "2rem", margin: 0 }}>Laddar kartdata…</p>}
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img"
          aria-label="Bristkarta per kommun i Jönköpings län"
          style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }} />
        {hovered && (
          <div style={{
            position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center",
            fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: "0.08em",
            color: "var(--rust)", pointerEvents: "none",
          }}>
            {hovered.toUpperCase()}
          </div>
        )}
      </div>
      <p className="coord" style={{ marginTop: 10 }}>
        KÄLLA: SCB GEODATA REGSO 2025 + AF YRKESBAROMETERN · {today}
      </p>
    </section>
  );
}
