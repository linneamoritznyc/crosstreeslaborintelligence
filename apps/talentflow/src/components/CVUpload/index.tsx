"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api-client";

export default function CVUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [accepterad, setAccepterad] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(selected: File | null | undefined) {
    if (!selected) return;
    if (!/\.(pdf|docx)$/i.test(selected.name)) {
      setError("Endast PDF- eller DOCX-filer stöds.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("Filen är för stor (max 5 MB).");
      return;
    }
    setError(null);
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !accepterad) return;
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${getApiUrl()}/cv/parse`, {
        method: "POST",
        body,
      });
      if (!res.ok) {
        throw new Error(`Uppladdning misslyckades (${res.status})`);
      }
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
    <div>
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
        <ul style={{ margin: "0 0 8px 20px", padding: 0 }}>
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
          Intelligence, Vetlanda. Kontakt:{" "}
          <a href="mailto:kontakt@crosstrees.se">kontakt@crosstrees.se</a>
        </p>
      </article>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          margin: "16px 0 20px",
          fontSize: "0.9375rem",
          color: "var(--color-ink-soft)",
          cursor: "pointer",
          padding: 12,
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border-soft)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <input
          type="checkbox"
          checked={accepterad}
          onChange={(e) => setAccepterad(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          Jag har läst informationen ovan och förstår att rekommendationerna är
          AI-genererade och inte ersätter professionell karriärrådgivning.
        </span>
      </label>

      <form onSubmit={handleSubmit}>
        <div
          onClick={() => accepterad && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && accepterad) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (accepterad) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!accepterad) return;
            handleFileSelect(e.dataTransfer.files[0]);
          }}
          role="button"
          tabIndex={accepterad ? 0 : -1}
          aria-label="Ladda upp CV — klicka eller dra in en fil"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-2xl) var(--space-md)",
            border: `2px dashed ${
              dragOver
                ? "var(--color-accent)"
                : accepterad
                ? "var(--color-border)"
                : "var(--color-border-soft)"
            }`,
            background: dragOver
              ? "var(--color-accent-soft)"
              : "var(--color-surface-2)",
            borderRadius: "var(--radius-lg)",
            cursor: accepterad ? "pointer" : "not-allowed",
            opacity: accepterad ? 1 : 0.5,
            transition: "background 0.15s ease, border-color 0.15s ease",
            textAlign: "center",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ color: "var(--color-accent)", marginBottom: 12 }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {file ? (
            <>
              <strong style={{ fontSize: "1rem" }}>{file.name}</strong>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-ink-muted)",
                  marginTop: 4,
                }}
              >
                {(file.size / 1024).toFixed(0)} KB · Klar för analys
              </span>
            </>
          ) : (
            <>
              <strong style={{ fontSize: "1rem", color: "var(--color-ink)" }}>
                Dra in ditt CV här
              </strong>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-ink-muted)",
                  marginTop: 4,
                }}
              >
                eller klicka för att välja fil — PDF eller DOCX, max 5 MB
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            name="cv"
            accept=".pdf,.docx"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            style={{ display: "none" }}
            disabled={!accepterad}
          />
        </div>

        {error && (
          <p role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!file || !accepterad || uploading}
          style={{ marginTop: 16, width: "100%", padding: "14px 18px", fontSize: "1rem" }}
        >
          {uploading ? "Analyserar CV…" : "Analysera mitt CV"}
        </button>
      </form>
    </div>
  );
}
