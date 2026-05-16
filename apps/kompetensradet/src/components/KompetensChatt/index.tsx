"use client";

import { useState, useRef } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function KompetensChatt() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [skickar, setSkickar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (!res.ok) throw new Error(`Chatt-fel (${res.status})`);
      const { content } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Fel: kunde inte nå AI-rådgivaren." },
      ]);
    } finally {
      setSkickar(false);
      inputRef.current?.focus();
    }
  }

  return (
    <section aria-label="AI-chatt">
      <ul aria-live="polite">
        {messages.map((m, i) => (
          <li key={i} data-role={m.role}>
            <strong>{m.role === "user" ? "Du" : "Rådgivaren"}:</strong> {m.content}
          </li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ställ en fråga om arbetsmarknaden…"
          disabled={skickar}
          aria-label="Din fråga"
        />
        <button type="submit" disabled={skickar || !input.trim()}>
          {skickar ? "Skickar…" : "Skicka"}
        </button>
      </form>
    </section>
  );
}
