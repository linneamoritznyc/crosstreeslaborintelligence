"use client";

import { useEffect, useRef } from "react";
import { NODES, EDGES, HIGHLIGHT_PATH, TOP_TRANSITIONS } from "./career-graph-data";

const CANVAS_H = 400;

export default function OmstallningsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = CANVAS_H;
    }
    resize();
    window.addEventListener("resize", resize);

    const scaleX = () => canvas!.width / 600;

    const hSet = new Set(HIGHLIGHT_PATH);
    const hEdges = new Set<number>();
    for (let i = 0; i < HIGHLIGHT_PATH.length - 1; i++) {
      const a = HIGHLIGHT_PATH[i], b = HIGHLIGHT_PATH[i + 1];
      EDGES.forEach((e, idx) => {
        if ((e.from === a && e.to === b) || (e.from === b && e.to === a)) hEdges.add(idx);
      });
    }

    let pathProg = 0;

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const sx = W / 600;
      ctx.clearRect(0, 0, W, CANVAS_H);

      EDGES.forEach((e, idx) => {
        const a = NODES[e.from], b = NODES[e.to];
        const isPath = hEdges.has(idx);
        ctx.beginPath();
        ctx.strokeStyle = isPath ? "rgba(122,46,26,0.55)" : "rgba(26,26,24,0.12)";
        ctx.lineWidth = isPath ? 1.2 : 0.5;
        ctx.moveTo(a.x * sx, a.y); ctx.lineTo(b.x * sx, b.y);
        ctx.stroke();
        const mx = ((a.x + b.x) / 2) * sx, my = (a.y + b.y) / 2;
        if (isPath) {
          ctx.font = "700 10px 'Courier Prime', monospace";
          ctx.fillStyle = "rgba(122,46,26,0.85)";
          ctx.textAlign = "center";
          ctx.fillText(String(e.w), mx, my - 4);
        }
      });

      NODES.forEach((n, i) => {
        const isPath = hSet.has(i);
        const fill = n.shortage ? "rgba(122,46,26," : "rgba(26,26,24,";
        const r = 4 + (isPath ? 1.5 : 0);
        ctx.beginPath();
        ctx.arc(n.x * sx, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isPath ? `${fill}0.85)` : `${fill}0.35)`;
        ctx.fill();
        if (isPath) {
          ctx.font = "700 11px 'Courier Prime', monospace";
          ctx.fillStyle = `${fill}0.9)`;
          ctx.textAlign = "left";
          ctx.fillText(n.label, n.x * sx + r + 4, n.y + 4);
        }
      });

      pathProg += 0.003;
      if (pathProg >= 1) pathProg = 0;
      const segs = HIGHLIGHT_PATH.length - 1;
      const prog = pathProg * segs;
      const si = Math.min(Math.floor(prog), segs - 1);
      const sp = prog - si;
      const pa = NODES[HIGHLIGHT_PATH[si]], pb = NODES[HIGHLIGHT_PATH[si + 1]];
      const tx = (pa.x + (pb.x - pa.x) * sp) * sx;
      const ty = pa.y + (pb.y - pa.y) * sp;
      ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(122,46,26,0.9)"; ctx.fill();
      ctx.beginPath(); ctx.arc(tx, ty, 9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(122,46,26,0.25)"; ctx.lineWidth = 1.5; ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="analys-section">
      <p className="rust-eyebrow">STEG 2 · OMSTÄLLNINGSANALYS</p>
      <h2 className="analys-h2">KARRIÄRÖVERGÅNGAR</h2>
      <p className="analys-subhead">
        Crosstrees identifierar transferabla kompetenser och visar vägar mellan överskotts- och
        bristyrken. Den animerade vägen markerar en optimal övergång baserad på
        ESCO-taxonomins substitutabilitetsdata.
      </p>

      <div className="omst-explainer">
        <span className="omst-dot" aria-hidden="true" />
        <p className="omst-plain">
          Den röda punkten visar en möjlig karriärväg — från <strong>Lagerarbetare</strong> till{" "}
          <strong>Undersköterska</strong>. Yrkena delar transferabla kompetenser enligt ESCO-taxonomin.
        </p>
      </div>

      <div className="analys-two-col" style={{ marginTop: 24 }}>
        <div>
          <canvas ref={canvasRef} aria-hidden="true"
            style={{ width: "100%", height: CANVAS_H, display: "block",
              border: "0.5px solid var(--border-faint)", background: "var(--parchment)" }} />
          <p className="coord" style={{ textAlign: "center", marginTop: 8 }}>
            44 YRKEN · 24 KOMPETENSÖVERLAPP · ESCO-TAXONOMIN
          </p>
        </div>

        <div>
          <p className="rust-eyebrow" style={{ marginBottom: 8 }}>MATCHNINGAR · EXEMPELVÄG</p>
          <p className="analys-subhead" style={{ fontSize: 14, marginBottom: 20, marginTop: 0 }}>
            Crosstrees rangordnar övergångar genom ESCO-substitutabilitetsdata och regional efterfrågan.
          </p>
          <div style={{ borderTop: "0.5px solid var(--border-faint)" }}>
            {TOP_TRANSITIONS.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between",
                alignItems: "baseline", padding: "11px 0",
                borderBottom: "0.5px solid var(--border-faint)" }}>
                <span style={{ fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic", fontSize: 14, color: "rgba(26,26,24,0.8)" }}>
                  {t.from} → {t.to}
                </span>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700,
                  fontSize: 14, color: "var(--rust)", marginLeft: 12 }}>
                  {t.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
