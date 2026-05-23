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
            "Som AI-system analyserar jag följande data: ingen tillgänglig (anslutning misslyckades).\n\nAI-analys tillfälligt otillgänglig — försök igen om en stund.\n\nDetta är en AI-genererad analys. Beslut fattas av ansvarig handläggare vid Kompetensrådet.",
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
        <div style={{ marginBottom: "1rem" }}>
          <p>Exempelfrågor (klicka för att fråga direkt):</p>
          <ul>
            {EXAMPELFRAGOR.map((f) => (
              <li key={f}>
                <button
                  type="button"
                  onClick={() => send(f)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0066cc",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                  }}
                  disabled={skickar}
                >
                  {f}
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
              padding: "0.75rem 1rem",
              margin: "0.5rem 0",
              background: m.role === "user" ? "#eef" : "#f5f5f5",
              borderRadius: "6px",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>{m.role === "user" ? "Du" : "Rådgivaren"}:</strong>{" "}
            {m.content}
          </li>
        ))}
        {skickar && (
          <li style={{ padding: "0.5rem 1rem", color: "#666" }}>
            <em>Rådgivaren skriver…</em>
          </li>
        )}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ställ en fråga om arbetsmarknaden i Jönköpings län…"
          disabled={skickar}
          aria-label="Din fråga"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" disabled={skickar || !input.trim()}>
          {skickar ? "Skickar…" : "Skicka"}
        </button>
      </form>
    </section>
  );
}
