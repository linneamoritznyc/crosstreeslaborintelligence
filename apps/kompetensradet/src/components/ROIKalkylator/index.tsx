"use client";

import { useState } from "react";

interface ROIResultat {
  roi_procent: number;
  payback_manader: number;
  netto_vinst_kr: number;
  antaganden: string[];
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kompetensradet/roi?${params}`);
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
        <label>
          Antal deltagare
          <input name="antal" type="number" min="1" required />
        </label>
        <label>
          Utbildningskostnad per person (kr)
          <input name="kostnad" type="number" min="0" required />
        </label>
        <label>
          Sektor
          <select name="sektor" required>
            <option value="">— välj —</option>
            <option value="industri">Industri</option>
            <option value="vard">Vård och omsorg</option>
            <option value="it">IT och digitalisering</option>
            <option value="bygg">Bygg och anläggning</option>
          </select>
        </label>
        <button type="submit" disabled={beraknar}>
          {beraknar ? "Beräknar…" : "Beräkna ROI"}
        </button>
        {fel && <p role="alert">{fel}</p>}
      </form>
      {resultat && (
        <section aria-label="ROI-resultat">
          <h2>Resultat</h2>
          <dl>
            <dt>ROI</dt>
            <dd>{resultat.roi_procent.toFixed(1)}%</dd>
            <dt>Återbetalningstid</dt>
            <dd>{resultat.payback_manader} månader</dd>
            <dt>Nettovinst</dt>
            <dd>{resultat.netto_vinst_kr.toLocaleString("sv-SE")} kr</dd>
          </dl>
          <h3>Antaganden</h3>
          <ul>
            {resultat.antaganden.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </section>
      )}
    </section>
  );
}
