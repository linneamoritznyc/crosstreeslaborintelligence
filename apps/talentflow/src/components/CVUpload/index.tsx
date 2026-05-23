"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CVUpload() {
  const router = useRouter();
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/parse`, {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error(`Uppladdning misslyckades (${res.status})`);
      const data = await res.json();
      const sessionId = data.session_id ?? data.session;
      if (!sessionId) throw new Error("Ingen session_id i svaret");
      router.push(`/resultat?session=${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="cv">CV-fil (PDF, DOCX eller TXT, max 5 MB)</label>
      <input id="cv" name="cv" type="file" accept=".pdf,.docx,.txt" required />
      <br />
      <button type="submit" disabled={uploading} style={{ marginTop: "1rem" }}>
        {uploading ? "Laddar upp…" : "Analysera CV"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--signal-rust)" }}>
          {error}
        </p>
      )}
    </form>
  );
}
