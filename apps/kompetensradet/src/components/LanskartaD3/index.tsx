"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface KommunData {
  kommun_kod: string;
  namn: string;
  brist_index: number;
}

interface Props {
  sektor: string;
}

export default function LanskartaD3({ sektor }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const controller = new AbortController();

    async function renderKarta() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kompetensradet/karta?sektor=${sektor}`,
        { signal: controller.signal }
      );
      if (!res.ok) return;
      const data: KommunData[] = await res.json();

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const maxBrist = d3.max(data, (d) => d.brist_index) ?? 1;
      const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, maxBrist]);

      svg
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("x", (_, i) => (i % 4) * 80 + 40)
        .attr("y", (_, i) => Math.floor(i / 4) * 40 + 30)
        .attr("fill", (d) => colorScale(d.brist_index))
        .text((d) => d.namn);
    }

    renderKarta().catch(() => {});
    return () => controller.abort();
  }, [sektor]);

  return (
    <section aria-label="Länkarta">
      <h2>Bristkarta — Jönköpings län</h2>
      <svg ref={svgRef} width={400} height={300} role="img" aria-label="Bristkarta per kommun" />
    </section>
  );
}
