import Link from "next/link";
import {
  getFitScore,
  getJobDetail,
  ApiError,
  ApiUnavailable,
  employerName,
  jobLocation,
  jobTitle,
} from "@/lib/api";
import MatchKvalitet from "@/components/MatchKvalitet";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
}

export default async function YrkePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { session } = await searchParams;

  if (!session) {
    return (
      <main className="sheet">
        <header className="sheet-header">
          <p className="sheet-eyebrow">04 · Yrkesvy</p>
          <h1 className="sheet-title">
            Ingen <span className="accent">session.</span>
          </h1>
          <p className="sheet-lede">
            Den här sidan visar hur väl en enskild annons matchar ditt CV.
            För att se det behöver du ladda upp ett CV först.
          </p>
        </header>
        <div className="empty-options">
          <Link href="/">Till start</Link>
        </div>
      </main>
    );
  }

  // Fetch job detail and fit score in parallel; degrade each independently.
  const [jobResult, scoreResult] = await Promise.allSettled([
    getJobDetail(id),
    getFitScore(session, id),
  ]);

  const job = jobResult.status === "fulfilled" ? jobResult.value : null;
  const score = scoreResult.status === "fulfilled" ? scoreResult.value : null;
  const scoreErr = scoreResult.status === "rejected" ? scoreResult.reason : null;
  const jobErr = jobResult.status === "rejected" ? jobResult.reason : null;

  if (!job && !score) {
    return (
      <main className="sheet">
        <header className="sheet-header">
          <p className="sheet-eyebrow">04 · Yrkesvy</p>
          <h1 className="sheet-title">
            Vi når inte <span className="accent">annonsen.</span>
          </h1>
          <p className="sheet-lede">
            Varken jobbinformationen eller matchningen kunde hämtas. Det
            är inte ditt fel — något är ur funktion hos oss.
          </p>
        </header>
        <div className="fail-note">
          <span className="fail-note-head">Vad som gick fel</span>
          {jobErr instanceof ApiError && `Annonsen: ${jobErr.status} ${jobErr.body.slice(0, 100)}`}
          {jobErr instanceof ApiUnavailable && "Annonsen: vi når inte servern."}
          {scoreErr instanceof ApiError && ` · Poängen: ${scoreErr.status}.`}
          {scoreErr instanceof ApiUnavailable && " · Poängen: vi når inte servern."}
        </div>
        <div className="empty-options" style={{ marginTop: 18 }}>
          <Link href={`/matchningar/${session}`}>Tillbaka till matchningar</Link>
        </div>
      </main>
    );
  }

  const title = job ? jobTitle(job) : "Annons utan titel";
  const employer = job ? employerName(job) : "—";
  const location = job ? jobLocation(job) : "";
  const descriptionText = job?.description?.text ?? "";

  return (
    <main className="sheet">
      <header className="sheet-header">
        <p className="sheet-eyebrow">04 · Yrkesvy</p>
        <h1 className="sheet-title">{title}</h1>
        <p className="sheet-lede">
          {employer}
          {location && ` · ${location}`}
        </p>
      </header>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Hur väl du matchar</span>
          <span className="step-num">poäng</span>
        </h2>
        {score ? (
          <>
            <div style={{ marginBottom: 18 }}>
              <MatchKvalitet
                score={score.score}
                ciLow={score.confidence_interval.low}
                ciHigh={score.confidence_interval.high}
              />
            </div>
            <p className="sheet-prose">
              Vi räknar viktat: arbetsgivarens krav väger 60 procent,
              önskemål 30 procent, övriga kompetenser 10 procent. Det
              gråa intervallet är Wilson-metoden — ju färre krav annonsen
              listar, desto bredare blir intervallet och desto mindre
              säker poängen.
            </p>
          </>
        ) : (
          <div className="fail-note">
            <span className="fail-note-head">Vi kunde inte räkna ut en poäng</span>
            {scoreErr instanceof ApiError && scoreErr.status === 404
              ? "Den här annonsen har inga utskrivna kompetenskrav i Platsbanken. Vi gissar inte fram en poäng från enbart annonstexten — det hade gett dig fel signal."
              : "Något är ur funktion hos oss just nu. Prova ladda om sidan om en stund."}
          </div>
        )}
      </section>

      {score && (
        <section className="sheet-section">
          <h2 className="sheet-section-head">
            <span>Vad du har och vad som saknas</span>
            <span className="step-num">80/20</span>
          </h2>
          <div className="split-grid">
            <div className="split-cell strengths">
              <p className="split-cell-head">
                <span className="label strength">Du har</span>
                <span className="count">{score.matched_required.length}</span>
              </p>
              {score.matched_required.length === 0 ? (
                <p className="sheet-prose">
                  Ingen av annonsens krav matchar dina kompetenser direkt.
                </p>
              ) : (
                <ul>
                  {score.matched_required.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="split-cell gaps">
              <p className="split-cell-head">
                <span className="label gap">Saknas</span>
                <span className="count">
                  {score.missing_required.length + score.missing_preferred.length}
                </span>
              </p>
              {score.missing_required.length === 0 && score.missing_preferred.length === 0 ? (
                <p className="sheet-prose">Inget uppenbart saknas.</p>
              ) : (
                <ul>
                  {score.missing_required.map((s) => (
                    <li key={s}>{s} · krav</li>
                  ))}
                  {score.missing_preferred.map((s) => (
                    <li key={`p-${s}`}>{s} · önskemål</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {descriptionText && (
        <section className="sheet-section">
          <h2 className="sheet-section-head">
            <span>Hela annonsen</span>
            <span className="step-num">källa</span>
          </h2>
          <p className="sheet-prose" style={{ whiteSpace: "pre-line", maxWidth: "62ch" }}>
            {descriptionText.slice(0, 1800)}
            {descriptionText.length > 1800 && " …"}
          </p>
        </section>
      )}

      <div className="empty-options" style={{ marginTop: 28 }}>
        <Link href={`/matchningar/${session}`}>← Alla matchningar</Link>
        <Link href={`/granska/${session}`}>Justera kompetenser</Link>
      </div>

      <aside className="act-note">
        <strong>EU AI Act · artikel 13</strong>
        Listan över krav och saknade kompetenser kommer från
        Arbetsförmedlingens kompetenstaxonomi i annonsen. Vi lägger inte
        till krav som arbetsgivaren själv inte skrivit ut.
      </aside>
    </main>
  );
}
