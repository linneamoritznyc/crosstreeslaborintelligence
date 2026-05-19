"use client";

import { useState } from "react";

interface ROIResultat {
  roi_procent: number | null;
  payback_manader: number | null;
  netto_vinst_kr: number | null;
  antaganden: string[];
}

const SEKTORER = [
  { value: "industri", label: "Industri" },
  { value: "vård", label: "Vård och omsorg" },
  { value: "it", label: "IT och digitalisering" },
  { value: "bygg", label: "Bygg och anläggning" },
  { value: "transport", label: "Transport och logistik" },
  { value: "handel", label: "Handel" },
];

function formatKr(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
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
        `${process.env.NEXT_PUBLIC_API_URL}/kompetensradet/roi?${params}`
      );
      if (!res.ok) throw new Error(`Beräkning misslyckades (HTTP ${res.status})`);
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
        <label>
          Antal deltagare
          <input name="antal" type="number" min="1" defaultValue="10" required />
        </label>
        <label>
          Utbildningskostnad per person (kr)
          <input name="kostnad" type="number" min="0" defaultValue="5000" required />
        </label>
        <label>
          Sektor
          <select name="sektor" required>
            <option value="">— välj —</option>
            {SEKTORER.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={beraknar}>
          {beraknar ? "Beräknar…" : "Beräkna ROI"}
        </button>
        {fel && <p className="alert alert-error" role="alert">{fel}</p>}
      </form>

      {resultat && (
        <div className="roi-result">
          <h2>Resultat</h2>
          <dl>
            <dt>ROI</dt>
            <dd>{resultat.roi_procent !== null ? `${resultat.roi_procent.toFixed(1)} %` : "—"}</dd>
            <dt>Återbetalningstid</dt>
            <dd>{resultat.payback_manader !== null ? `${resultat.payback_manader} mån` : "—"}</dd>
            <dt>Nettovinst</dt>
            <dd>{formatKr(resultat.netto_vinst_kr)}</dd>
          </dl>
          {resultat.antaganden.length > 0 && (
            <>
              <h3>Antaganden</h3>
              <ul style={{ paddingLeft: "1.1rem", fontSize: "0.85rem", color: "var(--muted)" }}>
                {resultat.antaganden.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}
