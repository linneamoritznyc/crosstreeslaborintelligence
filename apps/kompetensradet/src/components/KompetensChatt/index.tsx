"use client";

import { useEffect, useRef, useState } from "react";
import AIDisclaimer from "@/components/AIDisclaimer";
import { getApiUrl } from "@/lib/api-client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const FORSLAG = [
  "Vilka yrken i Jönköpings län har störst kompetensbrist inom vård?",
  "Hur ser efterfrågetrenden ut för tillverkningsindustrin senaste 12 månaderna?",
  "Vilka kommuner har störst överskott på lagerarbetare?",
  "Vilka YH-utbildningar i länet täcker IT-bristen bäst?",
];

export default function KompetensChatt() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [skickar, setSkickar] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingText]);

  async function sendMessage(text: string) {
    if (!text.trim() || skickar) return;
    const userMessage: ChatMessage = { role: "user", content: text };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setSkickar(true);
    setStreamingText("");

    try {
      const res = await fetch(`${getApiUrl()}/chatt/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`Chatt-fel (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assembled = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          if (event.startsWith("event: done")) continue;
          if (event.startsWith("event: error")) {
            throw new Error(event.replace(/^event: error\ndata: /, ""));
          }
          if (event.startsWith("data: ")) {
            const chunk = event.slice(6).replace(/\\n/g, "\n");
            assembled += chunk;
            setStreamingText(assembled);
          }
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: assembled }]);
      setStreamingText("");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? `Fel: ${err.message}`
              : "Fel: kunde inte nå AI-rådgivaren.",
        },
      ]);
      setStreamingText("");
    } finally {
      setSkickar(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <section className="card" aria-label="AI-rådgivare">
      <div className="card-header">
        <div>
          <span className="pill">AI-chatt · EU 2024/1689 Art. 50</span>
          <h2 className="card-title" style={{ marginTop: 8 }}>
            Fråga AI-rådgivaren
          </h2>
        </div>
      </div>

      <div className="ai-notice">
        <h3>Du chattar med ett AI-system</h3>
        Varje svar inleds med vilka datakällor som används och avslutas med en
        påminnelse om att besluten fattas av Kompetensrådets handläggare.
        Systemet svarar bara baserat på data det har — frågor utanför detta
        avvisas explicit.
      </div>

      {messages.length === 0 && (
        <div style={{ marginBottom: "var(--space-md)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-muted)" }}>
            Förslag på frågor:
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FORSLAG.map((f, i) => (
              <button
                key={i}
                type="button"
                className="secondary"
                onClick={() => sendMessage(f)}
                style={{ fontSize: "0.8125rem", padding: "6px 12px" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={transcriptRef}
        role="log"
        aria-live="polite"
        aria-label="Chatttranskript"
        style={{
          maxHeight: 460,
          overflowY: "auto",
          padding: messages.length > 0 ? "var(--space-md)" : 0,
          background: messages.length > 0 ? "var(--color-surface-2)" : "transparent",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-md)",
        }}
      >
        {messages.map((m, i) => (
          <article
            key={i}
            data-role={m.role}
            style={{
              marginBottom: 12,
              padding: "10px 14px",
              background: m.role === "user" ? "var(--color-accent-soft)" : "white",
              border: "1px solid var(--color-border-soft)",
              borderRadius: 8,
              fontSize: "0.9375rem",
            }}
          >
            <strong
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-ink-muted)",
                marginBottom: 4,
              }}
            >
              {m.role === "user" ? "Du" : "Rådgivaren"}
            </strong>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </article>
        ))}
        {streamingText && (
          <article
            data-role="assistant"
            style={{
              padding: "10px 14px",
              background: "white",
              border: "1px dashed var(--color-accent)",
              borderRadius: 8,
              fontSize: "0.9375rem",
            }}
          >
            <strong
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-accent)",
                marginBottom: 4,
              }}
            >
              Rådgivaren skriver…
            </strong>
            <div style={{ whiteSpace: "pre-wrap" }}>{streamingText}</div>
          </article>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "var(--space-sm)" }}
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

      <AIDisclaimer variant="long" />
    </section>
  );
}
