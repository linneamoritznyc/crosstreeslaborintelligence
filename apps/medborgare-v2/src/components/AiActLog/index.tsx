"use client";

import { useEffect, useState } from "react";
import { getSessionLog, type SessionLog } from "@/lib/api";

interface Props {
  sessionId: string;
}

export default function AiActLog({ sessionId }: Props) {
  const [log, setLog] = useState<SessionLog | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || log) return;
    getSessionLog(sessionId)
      .then(setLog)
      .catch(() => setError(true));
  }, [open, sessionId, log]);

  return (
    <details className="act-log" onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="act-log-summary">
        EU AI Act art. 12 — vad loggas om den här sessionen?
      </summary>

      {open && (
        <div className="act-log-body">
          {!log && !error && (
            <p className="sheet-prose"><em>Hämtar…</em></p>
          )}
          {error && (
            <p className="sheet-prose" style={{ color: "var(--signal-rust)" }}>
              Kunde inte hämta logginformation just nu.
            </p>
          )}
          {log && (
            <>
              <p className="act-log-intro">
                Nedan ser du exakt vad systemet registrerar om din session.
                Inga personuppgifter sparas — session-ID:t är ett slumpmässigt
                UUID utan koppling till din identitet.
              </p>

              <table className="act-log-table">
                <caption className="act-log-caption">Loggade fält vid CV-uppladdning</caption>
                <thead>
                  <tr>
                    <th scope="col">Fält</th>
                    <th scope="col">Vad det innehåller</th>
                  </tr>
                </thead>
                <tbody>
                  {log.logged_fields.map((f) => (
                    <tr key={f.field}>
                      <td><code>{f.field}</code></td>
                      <td>{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <dl className="act-log-dl">
                <dt>Session sparas i</dt>
                <dd>{log.retention.session_skills}</dd>
                <dt>AI-inferenslogg sparas i</dt>
                <dd>{log.retention.ai_act_log}</dd>
                <dt>Personuppgiftsansvarig</dt>
                <dd>{log.data_controller}</dd>
                <dt>AI-system som används</dt>
                <dd>{log.ai_system}</dd>
                <dt>Dina rättigheter</dt>
                <dd>{log.your_rights}</dd>
              </dl>

              <p className="act-log-session">
                Ditt session-ID: <code>{log.session_id}</code>
              </p>
            </>
          )}
        </div>
      )}
    </details>
  );
}
