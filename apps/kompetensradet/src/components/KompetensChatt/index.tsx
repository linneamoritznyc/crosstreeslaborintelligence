"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function KompetensChatt() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [skickar, setSkickar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSkickar(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatt/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { content } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Kunde inte nå AI-rådgivaren just nu." },
      ]);
    } finally {
      setSkickar(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="chat-container" aria-label="AI-chatt">
      <div className="chat-messages" aria-live="polite">
        {messages.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: "0.9rem", alignSelf: "center", marginTop: "auto" }}>
            Ställ en fråga om arbetsmarknaden i Jönköpings län
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "chat-msg chat-msg-user" : "chat-msg chat-msg-ai"}>
            {m.content}
          </div>
        ))}
        {skickar && (
          <div className="chat-msg chat-msg-ai" style={{ color: "var(--muted)" }}>
            …
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-row" onSubmit={sendMessage}>
        <input
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv din fråga…"
          disabled={skickar}
          aria-label="Din fråga"
        />
        <button className="chat-send" type="submit" disabled={skickar || !input.trim()}>
          Skicka
        </button>
      </form>
    </div>
  );
}
