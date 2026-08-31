"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as d3 from "d3";
import { SEKTOR_STIL, type SektorId } from "@/lib/natverk-typer";

interface MiniNod {
  id: string;
  namn: string;
  sektor: string;
  x?: number;
  y?: number;
}

interface Props {
  /** Refs, inte värden: d3 muterar positioner och byter ut transform
   *  utanför Reacts rendercykel, så ett fångat värde blir inaktuellt. */
  noderRef: RefObject<MiniNod[]>;
  transformRef: RefObject<d3.ZoomTransform>;
  storlekRef: RefObject<{ bredd: number; hojd: number }>;
  onHoppa: (x: number, y: number) => void;
}

const MINI_BREDD = 150;
const MINI_HOJD = 105;

/**
 * Översiktskarta i hörnet. Ritar hela nätverkets utbredning och en ram
 * runt den del som just nu syns i huvudvyn. Klick hoppar dit.
 *
 * Läser nodernas positioner direkt ur simuleringens array varje bildruta,
 * eftersom d3 muterar dem utanför Reacts kännedom.
 */
export default function Minikarta({
  noderRef,
  transformRef,
  storlekRef,
  onHoppa,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const omfangRef = useRef({ minX: 0, minY: 0, skala: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = MINI_BREDD * dpr;
    canvas.height = MINI_HOJD * dpr;

    let aktiv = true;

    const rita = () => {
      if (!aktiv) return;

      const transform = transformRef.current ?? d3.zoomIdentity;
      const { bredd, hojd } = storlekRef.current ?? { bredd: 1, hojd: 1 };
      const punkter = (noderRef.current ?? []).filter(
        (n) => typeof n.x === "number" && typeof n.y === "number"
      );

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, MINI_BREDD, MINI_HOJD);
      ctx.fillStyle = "rgba(8,9,15,0.82)";
      ctx.fillRect(0, 0, MINI_BREDD, MINI_HOJD);

      if (punkter.length === 0) {
        requestAnimationFrame(rita);
        return;
      }

      const xs = punkter.map((n) => n.x!);
      const ys = punkter.map((n) => n.y!);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const marginal = 12;
      const skala = Math.min(
        (MINI_BREDD - marginal * 2) / Math.max(maxX - minX, 1),
        (MINI_HOJD - marginal * 2) / Math.max(maxY - minY, 1)
      );
      omfangRef.current = { minX, minY, skala };

      const till = (x: number, y: number) => ({
        x: (x - minX) * skala + marginal,
        y: (y - minY) * skala + marginal,
      });

      for (const nod of punkter) {
        const p = till(nod.x!, nod.y!);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle =
          SEKTOR_STIL[nod.sektor as SektorId]?.farg ?? SEKTOR_STIL.ovrigt.farg;
        ctx.globalAlpha = 0.85;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Ram runt den del som syns i huvudvyn.
      const hornA = till(transform.invertX(0), transform.invertY(0));
      const hornB = till(transform.invertX(bredd), transform.invertY(hojd));
      ctx.strokeStyle = "rgba(0,207,255,0.85)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        hornA.x,
        hornA.y,
        Math.max(hornB.x - hornA.x, 2),
        Math.max(hornB.y - hornA.y, 2)
      );

      requestAnimationFrame(rita);
    };

    const ram = requestAnimationFrame(rita);
    return () => {
      aktiv = false;
      cancelAnimationFrame(ram);
    };
  }, [noderRef, transformRef, storlekRef]);

  return (
    <div className="natverk-minikarta">
      <canvas
        ref={canvasRef}
        style={{ width: MINI_BREDD, height: MINI_HOJD, display: "block" }}
        onClick={(h) => {
          const rect = h.currentTarget.getBoundingClientRect();
          const { minX, minY, skala } = omfangRef.current;
          const marginal = 12;
          const x = (h.clientX - rect.left - marginal) / skala + minX;
          const y = (h.clientY - rect.top - marginal) / skala + minY;
          onHoppa(x, y);
        }}
        aria-label="Översiktskarta över nätverket. Klicka för att hoppa dit."
      />
      <span className="natverk-minikarta-text">ÖVERSIKT</span>
    </div>
  );
}
