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
    title: "Vi hittar inga jobb i Jönköpings län som passar dina kompetenser just nu.",
    body: "Det är ett ärligt nej, inte en bugg. Platsbankens utbud byts ut varje dag — kom gärna tillbaka imorgon. Värt att veta: vi matchar bara annonser där arbetsgivaren har skrivit ut vilka kompetenser de söker, och så gör inte alla.",
  },
  "no-skills": {
    head: "Inga kompetenser att matcha mot",
    title: "Din session innehåller inga kompetenser.",
    body: "Det här händer oftast om CV:t var en skannad PDF (där texten är en bild) eller om vi tappade sessionen vid en omstart. Ladda upp CV:t på nytt som text-PDF, DOCX eller TXT.",
  },
  "all-filtered": {
    head: "Allt göms av dina gränser",
    title: "Dina gränser tog bort alla matchningar.",
    body: "Jobben som passar dina kompetenser innehöll också ord du valt att inte bli matchad mot. Du kan ta bort någon gräns — eller låta dem vara. Det är ditt val.",
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
            <em>{filteredCount} matchningar göms av dina gränser.</em>
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
