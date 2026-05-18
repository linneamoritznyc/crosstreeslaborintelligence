"use client";

import { useState } from "react";
import AIDisclaimer from "@/components/AIDisclaimer";
import SourceTag from "@/components/SourceTag";
import { getApiUrl } from "@/lib/api-client";

interface ROIResultat {
  net_benefit_kr: number | null;
  ci_95_low_kr: number | null;
  ci_95_high_kr: number | null;
  roi_procent: number | null;
  payback_manader: number | null;
  n_simulations: number;
  method: string;
  algorithm_version: string;
  antaganden: string[];
  sektor: string;
  sektor_namn: string;
}

function formatKr(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(n);
}

function formatMkr(n: number | null): string {
  if (n === null) return "—";
  return `${(n / 1_000_000).toFixed(1)} Mkr`;
}

export default function ROIKalkylator() {
  const [resultat, setResultat] = useState<ROIResultat | null>(null);
  const [beraknar, setBeraknar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFel(null);
    setBeraknar(true);
    const form = e.currentTarget;
    const params = new URLSearchParams({
      antal_deltagare: (form.elements.namedItem("antal") as HTMLInputElement).value,
      utbildningskostnad_kr: (form.elements.namedItem("kostnad") as HTMLInputElement).value,
      sektor: (form.elements.namedItem("sektor") as HTMLSelectElement).value,
      transition_score: (form.elements.namedItem("score") as HTMLInputElement).value,
    });
    try {
      const res = await fetch(`${getApiUrl()}/kompetensradet/roi?${params}`);
      if (!res.ok) throw new Error(`Beräkning misslyckades (${res.status})`);
      setResultat(await res.json());
    } catch (err) {
      setFel(err instanceof Error ? err.message : "Okänt fel");
    } finally {
      setBeraknar(false);
    }
  }

  return (
    <section className="card" aria-label="ROI-kalkylator">
      <div className="card-header">
        <div>
          <span className="pill">Steg 4 av 5 · ROI-kalkyl</span>
          <h2 className="card-title" style={{ marginTop: 8 }}>
            Avkastning på utbildningsinsats
          </h2>
          <p style={{ margin: 0, color: "var(--color-ink-soft)" }}>
            Bootstrap-simulering med 1 000 dragningar från historiska
            placeringsgrader. Resultatet visas alltid med 95% konfidensintervall
            — aldrig punktestimat.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-md)",
          marginBottom: "var(--space-lg)",
          alignItems: "end",
        }}
      >
        <div>
          <label htmlFor="antal">Antal deltagare</label>
          <input id="antal" name="antal" type="number" min="1" max="10000" defaultValue={20} required />
        </div>
        <div>
          <label htmlFor="kostnad">Utbildningskostnad (kr/person)</label>
          <input id="kostnad" name="kostnad" type="number" min="0" step="1000" defaultValue={45000} required />
        </div>
        <div>
          <label htmlFor="sektor">Sektor</label>
          <select id="sektor" name="sektor" required defaultValue="industri">
            <option value="industri">Industri</option>
            <option value="vard">Vård och omsorg</option>
            <option value="it">IT och digitalisering</option>
            <option value="bygg">Bygg och anläggning</option>
          </select>
        </div>
        <div>
          <label htmlFor="score">Övergångsgrad (0–1)</label>
          <input id="score" name="score" type="number" min="0" max="1" step="0.05" defaultValue={0.85} required />
        </div>
        <button type="submit" disabled={beraknar}>
          {beraknar ? "Simulerar 1 000 scenarier…" : "Beräkna ROI"}
        </button>
      </form>

      {fel && (
        <p role="alert" style={{ color: "var(--color-danger)" }}>
          {fel}
        </p>
      )}

      {resultat && resultat.net_benefit_kr !== null && (
        <>
          <div className="metric-grid">
            <div className="metric">
              <div className="metric-label">Nettonytta (medelvärde)</div>
              <div className="metric-value">{formatMkr(resultat.net_benefit_kr)}</div>
              <div className="metric-sub">{formatKr(resultat.net_benefit_kr)} kr</div>
            </div>
            <div className="metric">
              <div className="metric-label">95% konfidensintervall</div>
              <div className="metric-value" style={{ fontSize: "1.125rem" }}>
                {formatMkr(resultat.ci_95_low_kr)} – {formatMkr(resultat.ci_95_high_kr)}
              </div>
              <div className="metric-sub">
                {formatKr(resultat.ci_95_low_kr)} – {formatKr(resultat.ci_95_high_kr)} kr
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">ROI</div>
              <div className="metric-value">{resultat.roi_procent}%</div>
              <div className="metric-sub">Per investerad krona</div>
            </div>
            <div className="metric">
              <div className="metric-label">Återbetalningstid</div>
              <div className="metric-value">{resultat.payback_manader ?? "—"} mån</div>
              <div className="metric-sub">
                {resultat.n_simulations.toLocaleString("sv-SE")} simuleringar
              </div>
            </div>
          </div>

          <details
            style={{
              marginTop: "var(--space-lg)",
              padding: "var(--space-md)",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <summary
              style={{
                fontWeight: 600,
                fontSize: "0.9375rem",
                cursor: "pointer",
                color: "var(--color-ink)",
              }}
            >
              Visa alla antaganden ({resultat.antaganden.length})
            </summary>
            <ul style={{ marginTop: "var(--space-sm)", paddingLeft: 20 }}>
              {resultat.antaganden.map((a, i) => (
                <li key={i} style={{ fontSize: "0.875rem", marginBottom: 4 }}>
                  {a}
                </li>
              ))}
            </ul>
          </details>

          <SourceTag
            source={`Bootstrap-metod ${resultat.method} · ${resultat.algorithm_version}`}
          />
          <AIDisclaimer variant="long">
            <span>
              ROI-beräkningen är ett scenariounderlag baserat på historiska
              placeringsgrader. Värdena är osäkerhetsskattningar — använd
              konfidensintervallet, inte medelvärdet, för beslut. Slutligt
              beslut fattas av Kompetensrådet.
            </span>
          </AIDisclaimer>
        </>
      )}
    </section>
  );
}
