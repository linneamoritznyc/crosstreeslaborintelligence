"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  function share() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button onClick={share} style={{
      fontFamily: "'Courier Prime', monospace",
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      background: "transparent",
      color: copied ? "var(--ink)" : "var(--rust)",
      border: `0.5px solid ${copied ? "var(--ink)" : "var(--rust)"}`,
      padding: "8px 16px",
      cursor: "pointer",
      borderRadius: 0,
      transition: "color 0.15s, border-color 0.15s",
      flexShrink: 0,
    }}>
      {copied ? "Länk kopierad ✓" : "Dela analysen →"}
    </button>
  );
}
