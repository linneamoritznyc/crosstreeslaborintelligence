"use client";

import { useEffect, useRef } from "react";

const KOMMUNER = [
  "Jönköping", "Nässjö", "Värnamo", "Vetlanda", "Gislaved",
  "Eksjö", "Tranås", "Aneby", "Vaggeryd", "Sävsjö",
  "Gnosjö", "Mullsjö", "Habo",
];

export default function RegionCanvas() {
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
      canvas.width = parent ? parent.clientWidth : 360;
      canvas.height = 220;
    }
    resize();
    window.addEventListener("resize", resize);

    // 13 kommune nodes + ambient background nodes
    const kommunNodes = KOMMUNER.map((namn, i) => {
      const angle = (i / KOMMUNER.length) * Math.PI * 2 - Math.PI / 2;
      const radius = canvas.height * 0.35;
      return {
        x: canvas.width / 2 + Math.cos(angle) * radius * 0.85,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 4.5,
        namn,
        rust: i === 0,
      };
    });

    const ambientNodes = Array.from({ length: 32 }, () => ({
      x: 20 + Math.random() * (canvas.width - 40),
      y: 20 + Math.random() * (canvas.height - 40),
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.5 + 0.5,
      namn: null as string | null,
      rust: false,
    }));

    const allNodes = [...kommunNodes, ...ambientNodes];

    let t = 0;
    function tick() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t += 0.006;

      // Edges between kommune nodes
      for (let i = 0; i < kommunNodes.length; i++) {
        for (let j = i + 1; j < kommunNodes.length; j++) {
          const a = kommunNodes[i];
          const b = kommunNodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(26,26,24,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Ambient edges
      for (let i = 0; i < ambientNodes.length; i++) {
        for (let j = i + 1; j < ambientNodes.length; j++) {
          const a = ambientNodes[i];
          const b = ambientNodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(26,26,24,${(1 - dist / 80) * 0.09})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Ambient dots
      ambientNodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(26,26,24,0.22)";
        ctx.fill();
      });

      // Kommune nodes
      kommunNodes.forEach((n, i) => {
        const pulse = Math.sin(t + i * 0.7) * 1.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse + (n.rust ? 1.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = n.rust ? "rgba(122,46,26,0.82)" : "rgba(26,26,24,0.55)";
        ctx.fill();
        if (n.rust) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + pulse + 7, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(122,46,26,0.2)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.font = `${n.rust ? "700 " : ""}8.5px Courier Prime, monospace`;
        ctx.fillStyle = n.rust ? "rgba(122,46,26,0.9)" : "rgba(26,26,24,0.6)";
        ctx.fillText(n.namn, n.x + n.r + 5, n.y + 3);
      });

      // Move all nodes
      allNodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        const W2 = canvas.width;
        const H2 = canvas.height;
        if (n.x < n.r || n.x > W2 - n.r) n.vx *= -1;
        if (n.y < n.r || n.y > H2 - n.r) n.vy *= -1;
      });

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
        Kompetenstransferabilitet · 13 kommuner · Jönköpings län
      </p>
    </>
  );
}
