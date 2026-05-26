"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { SektorInfo } from "@/lib/sektor-data";

interface Props {
  sektor: string;
  info: SektorInfo;
}

export default function SectorHero({ sektor, info }: Props) {
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
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const DOTS = 90;
    const dots = Array.from({ length: DOTS }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.5,
    }));

    function tick() {
      if (!canvas || !ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(26,26,24,${(1 - dist / 130) * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(26,26,24,0.35)";
        ctx.fill();
      }
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    tick();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section style={{ position: "relative", minHeight: 420, display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--parchment-dark)", zIndex: 0 }} />
      <div className="hero-texture" style={{ zIndex: 1 }} />
      <svg className="hero-contours" viewBox="0 0 680 420" preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ zIndex: 2 }}>
        <path d="M-40 120 Q 200 90 400 140 T 720 110" fill="none" stroke="#1A1A18" strokeWidth="0.8" opacity="0.15" />
        <path d="M-40 240 Q 220 210 420 260 T 720 230" fill="none" stroke="#1A1A18" strokeWidth="0.8" opacity="0.15" />
        <path d="M-40 360 Q 200 330 400 380 T 720 350" fill="none" stroke="#1A1A18" strokeWidth="0.8" opacity="0.15" />
        <text x="430" y="135" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 51 m</text>
        <text x="430" y="255" fontFamily="Courier Prime, monospace" fontSize="8" fill="#1A1A18" opacity="0.5" letterSpacing="0.1em">— 112 m</text>
      </svg>
      <canvas ref={canvasRef} aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 3, width: "100%", height: "100%" }} />

      <div style={{ position: "relative", zIndex: 10, padding: "56px 40px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <Link href="/" style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 9,
            textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--rust)", textDecoration: "none" }}>
            ← TILLBAKA TILL SEKTORVALET
          </Link>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: "var(--muted)" }}>
            57°24′N · 15°04′E · JÖNKÖPINGS LÄN · {today}
          </span>
        </div>

        <div className="h1" style={{ fontSize: "clamp(64px, 9vw, 88px)", maxWidth: 700 }}>
          {info.h1Parts.map((part, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {part === info.rustWord
                ? <span className="accent">{part}</span>
                : part.endsWith(info.rustWord)
                  ? <>{part.slice(0, -info.rustWord.length)}<span className="accent">{info.rustWord}</span></>
                  : part}
            </span>
          ))}
        </div>

        <p className="analys-subhead" style={{ marginTop: 20 }}>{info.subhead}</p>
      </div>
    </section>
  );
}
