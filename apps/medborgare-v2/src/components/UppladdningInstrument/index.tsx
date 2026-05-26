"use client";

/**
 * Kalibreringsinstrument för CV-uppladdning.
 *
 * Lärdom från antiapathyjobportal: binär state "Analyserar..." → klar är
 * ett UX-problem. Användare som väntar 5-15 sekunder utan stegindikering
 * tror att systemet hängt. Här visas pipelinens faktiska etapper.
 *
 * Stegen är klientsides-uppskattning av backend-arbetet (matching-api gör
 * dem alla i ett anrop /cv/parse). Det sista steget bekräftas mot
 * faktiskt API-svar. Etiketten "ungefärlig" syns inte i UI:t men koden
 * är ärlig — vi går aldrig till "done" på sista steget förrän det
 * verkligen är klart.
 */

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseCv, ApiError, ApiUnavailable } from "@/lib/api";

type StageState = "pending" | "active" | "done" | "failed";

interface Stage {
  id: string;
  mark: string;
  label: string;
  /** Klientsides-uppskattning i ms tills nästa stage tar över */
  estMs: number;
}

const STAGES: Stage[] = [
  { id: "read", mark: "01", label: "Läser dokumentet", estMs: 700 },
  { id: "extract", mark: "02", label: "Extraherar text", estMs: 900 },
  { id: "identify", mark: "03", label: "Identifierar kompetenser via språkmodell", estMs: 3500 },
  { id: "esco", mark: "04", label: "Korsrefererar mot ESCO-taxonomin", estMs: 1200 },
  { id: "ready", mark: "05", label: "Förbereder navigationssession", estMs: 400 },
];

interface StageRowProps {
  stage: Stage;
  state: StageState;
}

function StageRow({ stage, state }: StageRowProps) {
  const stateText: Record<StageState, string> = {
    pending: "väntar",
    active: "pågår",
    done: "klart",
    failed: "fel",
  };
  return (
    <div className="stage" data-state={state}>
      <span className="stage-mark">{stage.mark}</span>
      <span className="stage-label">{stage.label}</span>
      <span className="stage-state">{stateText[state]}</span>
    </div>
  );
}

interface FailState {
  kind: "size" | "unavailable" | "server" | "empty";
  status?: number;
  detail?: string;
}

function failNote(fail: FailState): { head: string; body: string } {
  switch (fail.kind) {
    case "size":
      return {
        head: "Filen är för stor",
        body: "Tjänsten accepterar dokument upp till 5 MB. Detta är en gräns på Railway-backenden, inte ett gränssnittsval. Skicka en lättare version (TXT eller text-PDF utan skannade bilder).",
      };
    case "unavailable":
      return {
        head: "Backenden svarar inte",
        body: "Matching-API:n på Railway går inte att nå just nu. Inget i ditt CV gick förlorat — ingen text har lämnat din enhet. Försök igen om en minut, eller kontrollera om Railway har ett pågående avbrott.",
      };
    case "server":
      return {
        head: `Backenden returnerade ${fail.status}`,
        body:
          fail.detail ||
          "Servern bekräftade att din begäran nådde fram men kunde inte hantera den. Det här är inte ditt fel. Försök igen — om felet upprepas är det ett driftproblem.",
      };
    case "empty":
      return {
        head: "Inga kompetenser hittades",
        body:
          "Backenden parsade dokumentet men hittade noll yrkeskompetenser. Det betyder oftast att texten är inbäddad som bild (skannad PDF). Försök ladda upp en text-baserad fil (DOCX eller TXT, eller en PDF som är skapad från text).",
      };
  }
}

export default function UppladdningInstrument() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [stageIdx, setStageIdx] = useState<number>(-1);
  const [stageStates, setStageStates] = useState<StageState[]>(
    STAGES.map(() => "pending"),
  );
  const [fail, setFail] = useState<FailState | null>(null);

  const reset = useCallback(() => {
    setStageIdx(-1);
    setStageStates(STAGES.map(() => "pending"));
    setFail(null);
  }, []);

  async function run(picked: File) {
    reset();
    setRunning(true);

    // Storlek-check upfront (mirrors backend 5MB limit, fail honestly first)
    if (picked.size > 5 * 1024 * 1024) {
      setFail({ kind: "size" });
      setRunning(false);
      return;
    }

    // Drive stages 0..3 on estimated timing; stage 4 waits for API response.
    const localStates: StageState[] = STAGES.map(() => "pending");
    const setStage = (i: number, s: StageState) => {
      localStates[i] = s;
      setStageStates([...localStates]);
      if (s === "active") setStageIdx(i);
    };

    // Kick off the API call immediately, in parallel with stage animation.
    const apiPromise = parseCv(picked);

    // Animate stages 0..3 even if API is faster — they're a transparency device.
    setStage(0, "active");
    await wait(STAGES[0].estMs);
    setStage(0, "done");
    setStage(1, "active");
    await wait(STAGES[1].estMs);
    setStage(1, "done");
    setStage(2, "active");
    // Stay on stage 2 until API resolves (this is where Claude actually runs).
    try {
      const result = await apiPromise;
      setStage(2, "done");
      setStage(3, "active");
      await wait(STAGES[3].estMs);
      setStage(3, "done");
      setStage(4, "active");

      if (result.skill_count === 0) {
        setStage(4, "failed");
        setFail({ kind: "empty" });
        setRunning(false);
        return;
      }

      // Persist count so verification page can show real number
      try {
        sessionStorage.setItem(
          `cv:${result.session_id}:skill_count`,
          String(result.skill_count),
        );
        sessionStorage.setItem(
          `cv:${result.session_id}:filename`,
          picked.name,
        );
      } catch {
        // sessionStorage failure is not fatal — verification page will degrade.
      }

      await wait(STAGES[4].estMs);
      setStage(4, "done");
      router.push(`/granska/${result.session_id}`);
    } catch (err) {
      setStage(2, "failed");
      if (err instanceof ApiUnavailable) {
        setFail({ kind: "unavailable" });
      } else if (err instanceof ApiError) {
        if (err.status === 413) {
          setFail({ kind: "size" });
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
        Ladda upp CV — text-PDF, DOCX eller TXT
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
      />
      <p className="calibrator-meta">
        Max 5 MB · ingen filuppladdning utan din aktiva handling · texten
        skickas till matching-api på Railway och vidare till Anthropic
        för kompetensextraktion · session-id sparas i 24 h (EU AI Act art. 12)
      </p>
      <button
        type="submit"
        className="calibrator-btn"
        disabled={!file || running}
      >
        {running ? "Pågående analys" : "Starta analys →"}
      </button>

      {stageIdx >= 0 && (
        <div className="stages" aria-live="polite">
          {STAGES.map((s, i) => (
            <StageRow key={s.id} stage={s} state={stageStates[i]} />
          ))}
        </div>
      )}

      {fail && (
        <div className="fail-note" role="alert">
          <span className="fail-note-head">{failNote(fail).head}</span>
          {failNote(fail).body}
        </div>
      )}
    </form>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
