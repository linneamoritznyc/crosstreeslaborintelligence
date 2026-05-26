"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseCvStream, ApiError, ApiUnavailable, type ParseStageEvent } from "@/lib/api";

type StageState = "pending" | "active" | "done" | "failed";

interface Stage {
  id: string;
  mark: string;
  label: string;
  /** SSE stages that activate this row */
  triggers: ParseStageEvent["stage"][];
}

const STAGES: Stage[] = [
  { id: "read",     mark: "01", label: "Öppnar dokumentet",                       triggers: ["reading"] },
  { id: "extract",  mark: "02", label: "Läser ut texten",                          triggers: ["extracting"] },
  { id: "identify", mark: "03", label: "Hittar dina kompetenser med AI",           triggers: ["parsing"] },
  { id: "esco",     mark: "04", label: "Jämför med Arbetsförmedlingens taxonomi",  triggers: ["esco"] },
  { id: "ready",    mark: "05", label: "Förbereder dina resultat",                 triggers: ["done"] },
];

function stateText(s: StageState): string {
  return { pending: "väntar", active: "pågår", done: "klart", failed: "fastnade" }[s];
}

interface FailState {
  kind: "size" | "unavailable" | "server" | "empty" | "unconfigured";
  status?: number;
  detail?: string;
}

function failCopy(fail: FailState): { head: string; body: string } {
  switch (fail.kind) {
    case "size":
      return {
        head: "Filen är för stor",
        body: "Vi tar emot dokument upp till 5 MB. Spara om CV:t som en lättare PDF eller TXT — det brukar minska storleken till en bråkdel.",
      };
    case "unavailable":
      return {
        head: "Vi når inte vår server just nu",
        body: "Anropet gick aldrig fram. Inget av ditt CV är sparat hos oss. Försök igen om en minut — om det inte funkar då, vänta en kvart och pröva på nytt.",
      };
    case "server":
      return {
        head: `Servern svarade med fel ${fail.status}`,
        body:
          fail.detail ||
          "Vi tog emot din fil men kunde inte hantera den. Det är inte ditt fel. Försök igen — om samma fel kommer tillbaka är något ur funktion hos oss.",
      };
    case "empty":
      return {
        head: "Inga kompetenser kunde läsas ut",
        body: "Vi öppnade dokumentet men hittade ingen läsbar text. Det händer nästan alltid när texten är en bild — till exempel om CV:t är inskannat. Spara om det som DOCX, TXT, eller en text-PDF och ladda upp på nytt.",
      };
    case "unconfigured":
      return {
        head: "Systemet är inte fullt konfigurerat just nu",
        body: "AI-analysen är tillfälligt otillgänglig — det är inte ditt fel och inget av ditt CV är sparat hos oss. Försök igen om en stund eller kontakta oss om felet kvarstår.",
      };
  }
}

export default function UppladdningInstrument() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [stageStates, setStageStates] = useState<StageState[]>(STAGES.map(() => "pending"));
  const [activeIdx, setActiveIdx] = useState(-1);
  const [fail, setFail] = useState<FailState | null>(null);

  const reset = useCallback(() => {
    setStageStates(STAGES.map(() => "pending"));
    setActiveIdx(-1);
    setFail(null);
  }, []);

  const applyEvent = useCallback((evt: ParseStageEvent, local: StageState[]) => {
    const idx = STAGES.findIndex((s) => s.triggers.includes(evt.stage));
    if (idx === -1) return local;
    const next = [...local];
    // Mark previous stages done
    for (let i = 0; i < idx; i++) if (next[i] === "active") next[i] = "done";
    if (evt.stage === "done") {
      next[idx] = "done";
      for (let i = 0; i < idx; i++) next[i] = "done";
    } else {
      next[idx] = "active";
    }
    setActiveIdx(idx);
    setStageStates([...next]);
    return next;
  }, []);

  async function run(picked: File) {
    reset();
    setRunning(true);

    if (picked.size > 5 * 1024 * 1024) {
      setFail({ kind: "size" });
      setRunning(false);
      return;
    }

    let local: StageState[] = STAGES.map(() => "pending");

    try {
      const result = await parseCvStream(picked, (evt) => {
        local = applyEvent(evt, local);
      });

      if (result.skill_count === 0) {
        const next = [...local];
        const last = STAGES.length - 1;
        next[last] = "failed";
        setStageStates(next);
        setFail({ kind: "empty" });
        setRunning(false);
        return;
      }

      try {
        sessionStorage.setItem(`cv:${result.session_id}:skill_count`, String(result.skill_count));
        sessionStorage.setItem(`cv:${result.session_id}:filename`, picked.name);
      } catch {
        // sessionStorage failure is not fatal
      }

      router.push(`/granska/${result.session_id}`);
    } catch (err) {
      const errIdx = local.findIndex((s) => s === "active");
      if (errIdx >= 0) {
        const next = [...local];
        next[errIdx] = "failed";
        setStageStates(next);
      }
      if (err instanceof ApiUnavailable) {
        setFail({ kind: "unavailable" });
      } else if (err instanceof ApiError) {
        if (err.status === 413) {
          setFail({ kind: "size" });
        } else if (err.status === 503) {
          setFail({ kind: "unconfigured" });
        } else if (err.status === 422 && err.body.includes("empty")) {
          setFail({ kind: "empty" });
        } else {
          setFail({ kind: "server", status: err.status, detail: err.body.slice(0, 200) });
        }
      } else {
        setFail({ kind: "server", detail: String(err) });
      }
      setRunning(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || running) return;
    void run(file);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    if (next) reset();
  }

  return (
    <form className="calibrator" onSubmit={onSubmit}>
      <span className="calibrator-tick" />
      <label htmlFor="cv-file" className="calibrator-label">
        Välj fil — PDF, DOCX eller TXT
      </label>
      <input
        ref={inputRef}
        id="cv-file"
        name="cv"
        type="file"
        accept=".pdf,.docx,.txt"
        className="calibrator-input"
        onChange={onChange}
        disabled={running}
        aria-describedby="cv-meta"
      />
      <p id="cv-meta" className="calibrator-meta">
        Max 5 MB · texten skickas krypterat till Anthropic för kompetensextraktion ·
        sessionen sparas 24 timmar och raderas sedan (EU AI Act art. 12)
      </p>
      <button
        type="submit"
        className="calibrator-btn"
        disabled={!file || running}
        aria-busy={running}
      >
        {running ? "Analys pågår" : "Starta analys →"}
      </button>

      {activeIdx >= 0 && (
        <div className="stages" aria-live="polite" aria-label="Analyssteg">
          {STAGES.map((s, i) => (
            <div key={s.id} className="stage" data-state={stageStates[i]}>
              <span className="stage-mark" aria-hidden="true">{s.mark}</span>
              <span className="stage-label">{s.label}</span>
              <span className="stage-state">{stateText(stageStates[i])}</span>
            </div>
          ))}
        </div>
      )}

      {fail && (
        <div className="fail-note" role="alert">
          <span className="fail-note-head">{failCopy(fail).head}</span>
          {failCopy(fail).body}
        </div>
      )}
    </form>
  );
}
