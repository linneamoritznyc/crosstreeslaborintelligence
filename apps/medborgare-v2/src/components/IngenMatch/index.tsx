import Link from "next/link";

/**
 * Explicit empty state. Lärdom från antiapathyjobportal:
 * tysta fallback-val ("om inget matchar → använd customerservice") är
 * det farligaste i ett offentligt verktyg. Säg vad som hände, ge nästa steg.
 */

interface Props {
  sessionId: string;
  reason: "no-jobs" | "no-skills" | "all-filtered";
  filteredCount?: number;
}

const COPY: Record<Props["reason"], { head: string; title: string; body: string }> = {
  "no-jobs": {
    head: "Inga matchningar idag",
    title: "Vi hittar inga jobb i Jönköpings län som matchar dina kompetenser just nu.",
    body: "Det här är ett ärligt nej, inte en bugg. Platsbankens utbud förändras dagligen. Återkom imorgon, eller titta brett — vi söker bara annonser som har kompetenser uttryckt i sin annons, och det är inte alla.",
  },
  "no-skills": {
    head: "Inga kompetenser att matcha mot",
    title: "Sessionen innehåller inga kompetenser.",
    body: "Det är sannolikt en följd av att en skannad PDF laddades upp utan OCR, eller att backenden tappade sessionen vid en omstart. Ladda upp CV:t igen i textformat.",
  },
  "all-filtered": {
    head: "Allt filtrerades bort",
    title: "Dina gränser tog bort alla matchningar.",
    body: "Det betyder att tjänsterna som ringer in dina kompetenser också innehåller ämnen du valt att inte matchas mot. Du kan släppa något av filtren eller låta det stå — det är ditt val.",
  },
};

export default function IngenMatch({ sessionId, reason, filteredCount }: Props) {
  const copy = COPY[reason];
  return (
    <div className="empty-state">
      <p className="empty-head">{copy.head}</p>
      <p className="empty-title">{copy.title}</p>
      <p className="empty-prose">
        {copy.body}
        {filteredCount !== undefined && filteredCount > 0 && (
          <>
            {" "}
            <em>{filteredCount} matchningar dolda av filter.</em>
          </>
        )}
      </p>
      <div className="empty-options">
        <Link href={`/granska/${sessionId}`}>Justera kompetenser</Link>
        <Link href="/">Ladda upp nytt CV</Link>
      </div>
    </div>
  );
}
