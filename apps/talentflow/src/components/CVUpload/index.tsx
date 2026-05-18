"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api-client";

export default function CVUpload() {
  const router = useRouter();
  const [accepterad, setAccepterad] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const file = (form.elements.namedItem("cv") as HTMLInputElement).files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${getApiUrl()}/cv/parse`, {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error(`Uppladdning misslyckades (${res.status})`);
      const data = await res.json();
      const sessionId = data.session_id ?? data.job_id;
      if (!sessionId) throw new Error("Saknar session_id i svaret");
      router.push(`/resultat?session=${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="cv-upload">
      <article className="ai-notice" role="region" aria-label="AI Act-information">
        <h3>Innan du laddar upp ditt CV</h3>
        <p style={{ margin: "0 0 8px 0" }}>
          Det här systemet använder AI för att analysera dina yrkeskompetenser
          och generera karriärrekommendationer. Det är ett <strong>AI-system
          med hög risk</strong> enligt EU:s AI-förordning (EU 2024/1689,
          Bilaga III punkt 4).
        </p>
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Rekommendationerna bygger på:</strong>
        </p>
        <ul style={{ margin: "0 0 8px 18px", padding: 0 }}>
          <li>Arbetsförmedlingens substitutabilitetsdata</li>
          <li>ESCO-kompetenstaxonomi</li>
          <li>Aktuella platsannonser på Platsbanken</li>
        </ul>
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Resultaten är rekommendationer, inte beslut.</strong> Du
          fattar alltid det slutliga beslutet om dina ansökningar och din
          karriär.
        </p>
        <p style={{ margin: 0, fontSize: "0.8125rem" }}>
          Ditt CV-innehåll lagras inte. Tillfällig bearbetning av Anthropic
          (AI-modell), raderas inom 1 timme. Utvecklare: Crosstrees Labor
          Intelligence, Vetlanda. Kontakt: kontakt@crosstrees.se
        </p>
      </article>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          margin: "16px 0",
          fontSize: "0.9375rem",
          color: "var(--color-ink-soft)",
        }}
      >
        <input
          type="checkbox"
          checked={accepterad}
          onChange={(e) => setAccepterad(e.target.checked)}
          style={{ width: "auto", marginTop: 3 }}
        />
        <span>
          Jag har läst informationen ovan och förstår att rekommendationerna är
          AI-genererade och inte ersätter professionell karriärrådgivning.
        </span>
      </label>

      <form onSubmit={handleSubmit}>
        <label htmlFor="cv">Välj ditt CV (PDF eller DOCX)</label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.docx"
          required
          disabled={!accepterad}
        />
        <button
          type="submit"
          disabled={uploading || !accepterad}
          style={{ marginTop: 12 }}
        >
          {uploading ? "Laddar upp…" : "Analysera CV"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  );
}
