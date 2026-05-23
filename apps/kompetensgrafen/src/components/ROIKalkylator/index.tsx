"use client";

import { useState } from "react";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import DataLabel from "@/components/DataLabel";

interface ROIResultat {
  roi_procent: number | null;
  payback_manader: number | null;
  netto_vinst_kr: number | null;
  ci_95_low: number | null;
  ci_95_high: number | null;
  n_bootstrap?: number;
  antaganden: string[];
}

const SEKTORER = [
  { id: "industri", namn: "Industri" },
  { id: "vard", namn: "Vård och omsorg" },
  { id: "it", namn: "IT och digitalisering" },
  { id: "bygg", namn: "Bygg och anläggning" },
  { id: "logistik", namn: "Logistik och transport" },
  { id: "service", namn: "Service och handel" },
  { id: "utbildning", namn: "Utbildning" },
];

function formatKr(value: number | null): string {
  if (value === null) return "—";
  return `${value.toLocaleString("sv-SE")} kr`;
}

function formatMkr(value: number | null): string {
  if (value === null) return "—";
  return `${(value / 1_000_000).toFixed(1)} Mkr`;
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
    });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kompetensgrafen/roi?${params}`
      );
      if (!res.ok) throw new Error(`Beräkning misslyckades (${res.status})`);
      setResultat(await res.json());
    } catch (err) {
      setFel(err instanceof Error ? err.message : "Okänt fel");
    } finally {
      setBeraknar(false);
    }
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <label htmlFor="antal">Antal deltagare</label>
        <input
          id="antal"
          name="antal"
          type="number"
          min="1"
          defaultValue="30"
          required
        />
        <label htmlFor="kostnad">Utbildningskostnad per person (kr)</label>
        <input
          id="kostnad"
          name="kostnad"
          type="number"
          min="0"
          defaultValue="120000"
          required
        />
        <label htmlFor="sektor">Sektor</label>
        <select id="sektor" name="sektor" required defaultValue="industri">
          <option value="">— välj —</option>
          {SEKTORER.map((s) => (
            <option key={s.id} value={s.id}>
              {s.namn}
            </option>
          ))}
        </select>
        <br />
        <button type="submit" disabled={beraknar} style={{ marginTop: "1.5rem" }}>
          {beraknar ? "Beräknar…" : "Beräkna ROI"}
        </button>
        {fel && (
          <p role="alert" style={{ color: "var(--signal-rust)" }}>
            {fel}
          </p>
        )}
      </form>
      {resultat && (
        <section aria-label="ROI-resultat">
          <h2>Resultat</h2>
          {resultat.netto_vinst_kr === null ? (
            <p>
              <em>{resultat.antaganden[0] ?? "ROI kunde inte beräknas."}</em>
            </p>
          ) : (
            <>
              <table>
                <tbody>
                  <tr>
                    <th>Nettovinst (medelvärde)</th>
                    <td>
                      {formatMkr(resultat.netto_vinst_kr)}
                      <br />
                      <small className="data">
                        95% KI: {formatMkr(resultat.ci_95_low)} —{" "}
                        {formatMkr(resultat.ci_95_high)}
                      </small>
                    </td>
                  </tr>
                  <tr>
                    <th>ROI</th>
                    <td>{resultat.roi_procent?.toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <th>Återbetalningstid</th>
                    <td>{resultat.payback_manader} månader</td>
                  </tr>
                  <tr>
                    <th>Nettovinst exakt</th>
                    <td>{formatKr(resultat.netto_vinst_kr)}</td>
                  </tr>
                </tbody>
              </table>
              <h3>Antaganden och datakällor</h3>
              <ul>
                {resultat.antaganden.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
              <DataLabel source="SCB Lönestrukturstatistik 2024 + AF placeringsstatistik 2018–2024" />
              <AIActDisclaimer variant="roi" />
            </>
          )}
        </section>
      )}
    </section>
  );
}
