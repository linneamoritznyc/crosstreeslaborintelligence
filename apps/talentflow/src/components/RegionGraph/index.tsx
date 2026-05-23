"use client";

import { useEffect, useRef } from "react";

const LABELS = ["Vård", "Logistik", "IT", "Handel", "Bygg", "Utbildning", "Industri", "Service"];

export default function RegionGraph() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 320;
      canvas.width = Math.max(w, 200);
      canvas.height = 200;
    }
    resize();
    window.addEventListener("resize", resize);

    const NODES = 44;
    const nodes = Array.from({ length: NODES }, () => ({
      x: 20 + Math.random() * (canvas.width - 40),
      y: 20 + Math.random() * (canvas.height - 40),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 4 + 2,
      label: Math.random() < 0.22 ? LABELS[Math.floor(Math.random() * LABELS.length)] : null,
      rust: Math.random() < 0.15,
    }));

    function tick() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(26,26,24,${(1 - dist / 85) * 0.22})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.rust ? "rgba(122,46,26,0.75)" : "rgba(26,26,24,0.4)";
        ctx.fill();
        if (n.label) {
          ctx.font = "9px Courier Prime, monospace";
          ctx.fillStyle = "rgba(26,26,24,0.65)";
          ctx.fillText(n.label, n.x + n.r + 3, n.y + 3);
        }
      }
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < n.r || n.x > W - n.r) n.vx *= -1;
        if (n.y < n.r || n.y > H - n.r) n.vy *= -1;
      }
      raf.current = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="region-canvas" aria-hidden="true" />
      <p className="canvas-label">
        Kompetenstransferabilitet · Region Jönköping · levande data
      </p>
    </>
  );
}
