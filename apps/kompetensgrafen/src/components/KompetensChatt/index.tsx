"use client";

import { useState, useRef } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const EXAMPELFRAGOR = [
  "Vilka yrken har störst brist i Jönköpings län?",
  "Hur många maskinoperatörer finns i Värnamo?",
  "Vilka kommuner har flest IT-jobb just nu?",
  "Hur ser kompetensöverlappet mellan svetsare och vindkrafttekniker ut?",
];

export default function KompetensChatt() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [skickar, setSkickar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function send(text: string) {
    if (!text.trim()) return;
    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSkickar(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatt/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      if (!res.ok) throw new Error(`Chatt-fel (${res.status})`);
      const { content } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Som AI-system analyserar jag följande data: ingen tillgänglig (anslutning misslyckades).\n\nAI-analys tillfälligt otillgänglig. Försök igen om en stund.\n\nDetta är en AI-genererad analys. Beslut fattas av ansvarig handläggare vid Kompetensgrafen.",
        },
      ]);
    } finally {
      setSkickar(false);
      inputRef.current?.focus();
    }
  }

  return (
    <section aria-label="AI-chatt">
      {messages.length === 0 && (
        <div style={{ margin: "1.5rem 0" }}>
          <h3>Exempelfrågor</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {EXAMPELFRAGOR.map((f) => (
              <li
                key={f}
                style={{
                  borderTop: "1px solid var(--chart-line-faint)",
                  padding: "0.5rem 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => send(f)}
                  disabled={skickar}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    color: "var(--signal-rust)",
                    textTransform: "none",
                    letterSpacing: 0,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  → {f}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul aria-live="polite" style={{ listStyle: "none", padding: 0 }}>
        {messages.map((m, i) => (
          <li
            key={i}
            data-role={m.role}
            style={{
              borderTop: "1px solid var(--chart-line)",
              padding: "1rem 0",
              whiteSpace: "pre-wrap",
            }}
          >
            <small className="data">
              {m.role === "user" ? "DU" : "RÅDGIVAREN"}
            </small>
            <br />
            {m.content}
          </li>
        ))}
        {skickar && (
          <li
            style={{
              borderTop: "1px solid var(--chart-line)",
              padding: "1rem 0",
              fontStyle: "italic",
              color: "var(--ink-faint)",
            }}
          >
            Rådgivaren skriver…
          </li>
        )}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1.5rem",
          borderTop: "1px solid var(--ink)",
          paddingTop: "1rem",
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ställ en fråga om arbetsmarknaden i Jönköpings län…"
          disabled={skickar}
          aria-label="Din fråga"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={skickar || !input.trim()}>
          {skickar ? "Skickar…" : "Skicka"}
        </button>
      </form>
    </section>
  );
}
