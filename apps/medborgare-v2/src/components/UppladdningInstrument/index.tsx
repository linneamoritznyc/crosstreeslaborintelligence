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
  { id: "read", mark: "01", label: "Öppnar dokumentet", estMs: 700 },
  { id: "extract", mark: "02", label: "Läser ut texten", estMs: 900 },
  { id: "identify", mark: "03", label: "Hittar dina kompetenser med AI", estMs: 3500 },
  { id: "esco", mark: "04", label: "Jämför med Arbetsförmedlingens taxonomi", estMs: 1200 },
  { id: "ready", mark: "05", label: "Förbereder dina resultat", estMs: 400 },
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
    failed: "fastnade",
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
        body: "Vi tar emot dokument upp till 5 MB. Om din fil är större kan du oftast spara om den som en lättare PDF eller TXT — då brukar storleken bli en bråkdel.",
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
        body:
          "Vi öppnade dokumentet men hittade ingen läsbar text. Det händer nästan alltid när texten är en bild — till exempel om CV:t är inskannat. Spara om det som DOCX, TXT, eller en text-PDF och ladda upp på nytt.",
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
      />
      <p className="calibrator-meta">
        Max 5 MB · ingenting laddas upp innan du klickar nedan · texten
        skickas krypterat till oss och vidare till Anthropic för att
        läsa ut kompetenserna · sessionen sparas i 24 timmar och
        raderas sedan (EU AI Act art. 12)
      </p>
      <button
        type="submit"
        className="calibrator-btn"
        disabled={!file || running}
      >
        {running ? "Analys pågår" : "Starta analys →"}
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
