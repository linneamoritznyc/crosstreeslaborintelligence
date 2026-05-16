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
      const { session_id } = await res.json();
      router.push(`/resultat?session=${session_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="cv">Välj ditt CV (PDF eller DOCX)</label>
      <input id="cv" name="cv" type="file" accept=".pdf,.docx" required />
      <button type="submit" disabled={uploading}>
        {uploading ? "Laddar upp…" : "Analysera CV"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
