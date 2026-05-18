"use client";

import { useRouter } from "next/navigation";

export default function BackLink() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="secondary"
      style={{
        background: "transparent",
        border: "none",
        color: "var(--color-ink-muted)",
        padding: "6px 0",
        fontSize: "0.875rem",
        textDecoration: "none",
        cursor: "pointer",
        marginBottom: 8,
      }}
    >
      ← Tillbaka till resultat
    </button>
  );
}
