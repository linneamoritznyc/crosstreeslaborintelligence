"use client";

import { useState, useEffect, useRef } from "react";

const COST_PER_PERSON = 185_000;
const SAVING_PER_PERSON = 742_000;
const ROI_PCT = 301;

function fmtKr(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} MKR`;
  return `${Math.round(n / 1000)} TKR`;
}

function fmtSign(n: number) {
  const prefix = n >= 0 ? "+" : "";
  return prefix + fmtKr(Math.abs(n));
}

export default function ROIBlock({ sektor }: { sektor: string }) {
  const [antal, setAntal] = useState(100);
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.style.animation = "sliderWiggle 0.7s ease";
      el.addEventListener("animationend", () => { el.style.animation = ""; }, { once: true });
    }, 800);
    return () => clearTimeout(t);
  }, []);
  const total_cost = antal * COST_PER_PERSON;
  const total_saving = antal * SAVING_PER_PERSON;
  const net = total_saving - total_cost;

  return (
    <section className="analys-section">
      <p className="rust-eyebrow">STEG 3 · BUSINESS CASE</p>
      <h2 className="analys-h2">ROI FÖR REGIONEN</h2>
      <p className="analys-subhead">
        Beräkning baserad på Cost-Benefit Analysis-metoden från IFAU och OECD: kostnaden för en
        omställning ställs mot besparingen i arbetslöshetsersättning, ökade skatteintäkter och
        minskade vakansförluster.
      </p>

      <div className="roi-grid" style={{ marginTop: 32 }}>
        <div className="roi-cell">
          <p className="rust-eyebrow" style={{ margin: "0 0 8px" }}>KOSTNAD · PER PERSON</p>
          <div className="stats-val">185 000 KR</div>
          <p className="stats-note" style={{ marginTop: 8 }}>
            Snittkostnad utbildning + handledning, 18 månader.
            Källa: Yrkesvux och regional yrkesutbildning.
          </p>
        </div>
        <div className="roi-cell">
          <p className="rust-eyebrow" style={{ margin: "0 0 8px" }}>BESPARING · PER PERSON · 5 ÅR</p>
          <div className="stats-val rust">742 000 KR</div>
          <p className="stats-note" style={{ marginTop: 8 }}>
            Minskad A-kassa, ökade skatteintäkter, minskad vakanstid i bristyrket.
          </p>
        </div>
        <div className="roi-cell">
          <p className="rust-eyebrow" style={{ margin: "0 0 8px" }}>NETTOAVKASTNING · ROI</p>
          <div className="stats-val rust">{ROI_PCT}%</div>
          <p className="stats-note" style={{ marginTop: 8 }}>
            Avkastning över 5 år per investerad krona i omställning.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 40, padding: "28px 32px", borderTop: "0.5px solid var(--border-faint)",
        borderBottom: "0.5px solid var(--border-faint)" }}>
        <p className="rust-eyebrow" style={{ marginBottom: 6 }}>ANTAL OMSTÄLLNINGAR I REGIONEN</p>
        <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic",
          fontSize: 15, color: "var(--ink-soft)", margin: "0 0 14px" }}>
          Dra reglaget. Se hur totalkostnaden och besparingen förändras.
        </p>
        <input ref={sliderRef} type="range" min={10} max={500} value={antal}
          onChange={e => setAntal(Number(e.target.value))}
          aria-label="Antal omställningar"
          style={{ width: "100%", maxWidth: 420, accentColor: "var(--rust)",
            appearance: "none", height: 3, background: "var(--ink)", outline: "none",
            cursor: "pointer" }} />
        <div style={{ display: "flex", gap: 0, marginTop: 28,
          borderTop: "0.5px solid var(--border-faint)" }}>
          {[
            { label: "TOTAL INVESTERING", value: fmtKr(total_cost), rust: false },
            { label: "TOTAL BESPARING 5 ÅR", value: fmtKr(total_saving), rust: true },
            { label: "NETTOEFFEKT", value: fmtSign(net), rust: true },
          ].map(({ label, value, rust }) => (
            <div key={label} style={{ flex: 1, padding: "20px 16px",
              borderRight: "0.5px solid var(--border-faint)" }}
              className={label === "NETTOEFFEKT" ? "" : ""}>
              <p className="rust-eyebrow" style={{ marginBottom: 6 }}>{label}</p>
              <div className="stats-val" style={{ color: rust ? "var(--rust)" : "var(--ink)", fontSize: 28 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
        <p className="coord" style={{ marginTop: 16 }}>VALT ANTAL: {antal} OMSTÄLLNINGAR</p>
      </div>

      <p className="coord" style={{ marginTop: 12 }}>
        BERÄKNINGSGRUND: IFAU RAPPORT 2025:28 · OECD COST-BENEFIT FRAMEWORK · CROSSTREES ROI-MODELL V1
      </p>
    </section>
  );
}
