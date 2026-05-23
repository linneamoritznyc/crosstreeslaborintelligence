"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROFILER = [
  { id: "maskinoperator", namn: "Maskinoperatör — industri" },
  { id: "undersköterska", namn: "Undersköterska — vård" },
  { id: "mjukvaruutvecklare", namn: "Mjukvaruutvecklare — IT" },
  { id: "lagerarbetare", namn: "Lagerarbetare — logistik" },
];

export default function DemoSession() {
  const router = useRouter();
  const [valdProfil, setValdProfil] = useState(PROFILER[0].id);
  const [skickar, setSkickar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  async function startaDemo() {
    setFel(null);
    setSkickar(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/demo/session?profil=${valdProfil}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`Demo-fel (${res.status})`);
      const { session_id } = await res.json();
      router.push(`/resultat?session=${session_id}`);
    } catch (err) {
      setFel(err instanceof Error ? err.message : "Okänt fel");
      setSkickar(false);
    }
  }

  return (
    <div>
      <label htmlFor="profil">Demoprofil</label>
      <select
        id="profil"
        value={valdProfil}
        onChange={(e) => setValdProfil(e.target.value)}
        disabled={skickar}
      >
        {PROFILER.map((p) => (
          <option key={p.id} value={p.id}>
            {p.namn}
          </option>
        ))}
      </select>
      <br />
      <button type="button" onClick={startaDemo} disabled={skickar} style={{ marginTop: "1rem" }}>
        {skickar ? "Startar…" : "Starta demo"}
      </button>
      {fel && (
        <p role="alert" style={{ color: "var(--signal-rust)" }}>
          {fel}
        </p>
      )}
    </div>
  );
}
