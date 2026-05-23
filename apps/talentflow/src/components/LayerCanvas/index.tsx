"use client";

import { useEffect, useRef } from "react";

type Variant = "semantic" | "taxonomic" | "regional";

interface Props {
  variant: Variant;
}

export default function LayerCanvas({ variant }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 340;
    canvas.height = 190;

    if (variant === "semantic") {
      const clusters = [
        { cx: 80, cy: 95, r: 38, label: "Ledarskap", color: "rgba(122,46,26,", skills: ["Teamleda", "Planera", "Delegera", "Motivera"] },
        { cx: 185, cy: 65, r: 34, label: "Analys", color: "rgba(60,90,60,", skills: ["Excel", "Statistik", "Rapport", "Data"] },
        { cx: 260, cy: 110, r: 30, label: "Kommunikation", color: "rgba(40,60,100,", skills: ["Presentera", "Skriva", "Lyssna"] },
        { cx: 155, cy: 145, r: 28, label: "Organisation", color: "rgba(80,50,20,", skills: ["Schema", "Budget", "Admin"] },
      ];
      const dots: Array<{ x: number; y: number; vx: number; vy: number; r: number; ci: number; color: string }> = [];
      clusters.forEach((cl, ci) => {
        cl.skills.forEach((_, si) => {
          const a = si * ((Math.PI * 2) / cl.skills.length);
          const r = cl.r * 0.65 * (0.6 + Math.random() * 0.4);
          dots.push({
            x: cl.cx + Math.cos(a) * r + (Math.random() - 0.5) * 10,
            y: cl.cy + Math.sin(a) * r + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            r: 2.2,
            ci,
            color: cl.color,
          });
        });
      });

      let t = 0;
      function tick() {
        if (!ctx || !canvas) return;
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        t += 0.008;

        clusters.forEach((cl, ci) => {
          const pulse = Math.sin(t + ci * 1.3) * 3;
          ctx.beginPath();
          ctx.arc(cl.cx, cl.cy, cl.r + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `${cl.color}0.12)`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cl.cx, cl.cy, cl.r * 0.55 + pulse * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `${cl.color}0.06)`;
          ctx.fill();
          ctx.font = "700 9px Courier Prime, monospace";
          ctx.fillStyle = `${cl.color}0.55)`;
          ctx.textAlign = "center";
          ctx.fillText(cl.label, cl.cx, cl.cy - cl.r - 5);
        });

        for (let i = 0; i < dots.length; i++) {
          for (let j = i + 1; j < dots.length; j++) {
            const a = dots[i];
            const b = dots[j];
            if (a.ci !== b.ci) continue;
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 55) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `${a.color}${(1 - d / 55) * 0.2})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        dots.forEach((d) => {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `${d.color}0.7)`;
          ctx.fill();
        });

        const prog = (t * 0.4) % 1;
        const fromDot = dots[0];
        const toDot = dots[dots.length - 3];
        const hx = fromDot.x + (toDot.x - fromDot.x) * prog;
        const hy = fromDot.y + (toDot.y - fromDot.y) * prog;
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(122,46,26,0.85)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx, hy, 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(122,46,26,0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = "left";
        dots.forEach((d) => {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 5 || d.x > W - 5) d.vx *= -1;
          if (d.y < 5 || d.y > H - 5) d.vy *= -1;
        });
        raf.current = requestAnimationFrame(tick);
      }
      tick();
    }

    if (variant === "taxonomic") {
      const occupations = [
        { x: 60, y: 95, label: "Sjuksköterska", r: 7, color: "rgba(50,80,60," },
        { x: 130, y: 50, label: "Koordinator", r: 5, color: "rgba(60,90,70," },
        { x: 130, y: 140, label: "Undersköterska", r: 5, color: "rgba(50,80,60," },
        { x: 200, y: 70, label: "Projektledare", r: 6, color: "rgba(70,80,50," },
        { x: 200, y: 130, label: "Socialsekreterare", r: 4, color: "rgba(60,80,70," },
        { x: 275, y: 60, label: "HR-specialist", r: 5, color: "rgba(60,70,90," },
        { x: 275, y: 100, label: "Analytiker", r: 6, color: "rgba(40,60,100," },
        { x: 275, y: 145, label: "Dataanalytiker", r: 7, color: "rgba(30,50,120," },
      ];
      const edges = [
        { a: 0, b: 1, w: 75 }, { a: 0, b: 2, w: 75 }, { a: 1, b: 3, w: 50 },
        { a: 2, b: 4, w: 50 }, { a: 3, b: 5, w: 50 }, { a: 3, b: 6, w: 75 },
        { a: 6, b: 7, w: 75 }, { a: 4, b: 5, w: 25 }, { a: 1, b: 4, w: 25 },
      ];
      const highlightPath = [0, 1, 3, 6, 7];

      let t = 0;
      function tick() {
        if (!ctx || !canvas) return;
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        t += 0.01;
        const pathProg = (t * 0.3) % 1;

        edges.forEach((e) => {
          const a = occupations[e.a];
          const b = occupations[e.b];
          const isOnPath = highlightPath.includes(e.a) && highlightPath.includes(e.b) &&
            Math.abs(highlightPath.indexOf(e.a) - highlightPath.indexOf(e.b)) === 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          if (isOnPath) {
            ctx.strokeStyle = "rgba(30,50,120,0.55)";
            ctx.lineWidth = 2;
          } else {
            ctx.strokeStyle = "rgba(26,26,24,0.12)";
            ctx.lineWidth = 0.7;
            ctx.setLineDash([2, 3]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          ctx.font = "700 8px Courier Prime, monospace";
          ctx.fillStyle = isOnPath ? "rgba(30,50,120,0.8)" : "rgba(26,26,24,0.3)";
          ctx.textAlign = "center";
          ctx.fillText(String(e.w), mx, my - 4);
        });

        occupations.forEach((n, i) => {
          const isPath = highlightPath.includes(i);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + (isPath ? 1.5 : 0), 0, Math.PI * 2);
          ctx.fillStyle = isPath ? `${n.color}0.85)` : `${n.color}0.35)`;
          ctx.fill();
          ctx.font = `${isPath ? "700 " : ""}8px Courier Prime, monospace`;
          ctx.fillStyle = isPath ? `${n.color}0.9)` : "rgba(26,26,24,0.4)";
          ctx.textAlign = "left";
          ctx.fillText(n.label, n.x + n.r + 4, n.y + 3);
        });

        const totalSegs = highlightPath.length - 1;
        const prog = pathProg * totalSegs;
        const si = Math.min(Math.floor(prog), totalSegs - 1);
        const sp = prog - si;
        const pa = occupations[highlightPath[si]];
        const pb = occupations[highlightPath[si + 1]];
        const tx = pa.x + (pb.x - pa.x) * sp;
        const ty = pa.y + (pb.y - pa.y) * sp;
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30,50,120,0.9)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tx, ty, 9, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(30,50,120,0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = "left";
        raf.current = requestAnimationFrame(tick);
      }
      tick();
    }

    if (variant === "regional") {
      const regions = [
        { x: 50, label: "Vetlanda", demand: [0.3, 0.35, 0.4, 0.38, 0.42] },
        { x: 120, label: "Jönköping", demand: [0.5, 0.55, 0.62, 0.68, 0.75] },
        { x: 190, label: "Göteborg", demand: [0.6, 0.65, 0.7, 0.72, 0.8] },
        { x: 260, label: "Stockholm", demand: [0.7, 0.75, 0.78, 0.82, 0.9] },
      ];
      const years = ["2022", "2023", "2024", "2025", "2026"];
      const colors = [
        "rgba(100,70,30,",
        "rgba(50,90,60,",
        "rgba(30,60,120,",
        "rgba(122,46,26,",
      ];

      let t = 0;
      let barAnim = 0;
      function tick() {
        if (!ctx || !canvas) return;
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        t += 0.008;
        barAnim = Math.min(1, barAnim + 0.018);

        const barW = 14;
        const barGap = 16;
        const maxH = H - 55;
        const startX = 20;

        ctx.beginPath();
        ctx.moveTo(startX, 15);
        ctx.lineTo(startX, H - 30);
        ctx.strokeStyle = "rgba(26,26,24,0.2)";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        years.forEach((y, yi) => {
          const gx = startX + 10 + yi * (barW * regions.length + barGap * 0.2);
          ctx.font = "8px Courier Prime, monospace";
          ctx.fillStyle = "rgba(26,26,24,0.4)";
          ctx.textAlign = "center";
          ctx.fillText(y, gx + (barW * regions.length) * 0.5, H - 14);
        });

        years.forEach((_, yi) => {
          const baseX = startX + 10 + yi * (barW * regions.length + barGap * 0.2);
          regions.forEach((reg, ri) => {
            const val = reg.demand[yi] * barAnim;
            const bh = val * maxH;
            const bx = baseX + ri * barW;
            const by = H - 30 - bh;
            const pulse = Math.sin(t * 1.5 + ri * 0.8) * 0.015 * barAnim;
            ctx.fillStyle = `${colors[ri]}${0.55 + pulse})`;
            ctx.fillRect(bx + 1, by, barW - 2, bh);
            ctx.fillStyle = `${colors[ri]}0.85)`;
            ctx.fillRect(bx + 1, by, barW - 2, 2);
          });
        });

        regions.forEach((reg, ri) => {
          ctx.fillStyle = `${colors[ri]}0.7)`;
          ctx.fillRect(20 + ri * 80, H - 8, 8, 5);
          ctx.font = "8px Courier Prime, monospace";
          ctx.fillStyle = "rgba(26,26,24,0.5)";
          ctx.textAlign = "left";
          ctx.fillText(reg.label, 31 + ri * 80, H - 4);
        });

        ctx.beginPath();
        years.forEach((_, yi) => {
          const gx = startX + 10 + yi * (barW * regions.length + barGap * 0.2) + barW * 3.5;
          const gy = H - 30 - regions[3].demand[yi] * maxH * barAnim;
          if (yi === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        });
        ctx.strokeStyle = "rgba(122,46,26,0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "700 9px Courier Prime, monospace";
        ctx.fillStyle = "rgba(122,46,26,0.65)";
        ctx.textAlign = "right";
        ctx.fillText("Efterfrågeutveckling →", W - 8, 20);
        ctx.textAlign = "left";

        raf.current = requestAnimationFrame(tick);
      }
      tick();
    }

    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [variant]);

  return <canvas ref={ref} width={340} height={190} aria-hidden="true" />;
}
