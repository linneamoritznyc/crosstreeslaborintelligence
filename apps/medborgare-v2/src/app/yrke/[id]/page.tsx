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
          <h1 className="sheet-title">Ingen session.</h1>
          <p className="sheet-lede">
            Den här sidan visar matchning mellan en specifik annons och en
            CV-session. Ladda upp ett CV först.
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
            Kan inte ladda <span className="accent">annonsen.</span>
          </h1>
          <p className="sheet-lede">
            Varken jobbdata eller matchningspoäng gick att hämta. Det är
            inte ditt fel — det är ett backend-problem.
          </p>
        </header>
        <div className="fail-note">
          <span className="fail-note-head">Felinformation</span>
          {jobErr instanceof ApiError && `Jobbet: ${jobErr.status} ${jobErr.body.slice(0, 100)}`}
          {jobErr instanceof ApiUnavailable && "Jobbet: API onåbart."}
          {scoreErr instanceof ApiError && ` · Poängen: ${scoreErr.status}.`}
          {scoreErr instanceof ApiUnavailable && " · Poängen: API onåbart."}
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
          <span>Matchning mot din CV-session</span>
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
              Beräknad med viktad överlapp (krav 60 % · önskvärt 30 % · bonus 10 %).
              Konfidensintervallet är Wilson-metoden med 95 % täckning över
              antal kravkompetenser i annonsen.
            </p>
          </>
        ) : (
          <div className="fail-note">
            <span className="fail-note-head">Poäng kunde inte beräknas</span>
            {scoreErr instanceof ApiError && scoreErr.status === 404
              ? "Annonsen saknar strukturerade kompetenskrav i Platsbankens API. Vi fabricerar inte en poäng från text — då hade vi gett dig fel signal."
              : "Det är ett driftproblem. Prova ladda om sidan."}
          </div>
        )}
      </section>

      {score && (
        <section className="sheet-section">
          <h2 className="sheet-section-head">
            <span>Styrkor mot gap</span>
            <span className="step-num">80/20</span>
          </h2>
          <div className="split-grid">
            <div className="split-cell strengths">
              <p className="split-cell-head">
                <span className="label strength">Styrkor</span>
                <span className="count">{score.matched_required.length}</span>
              </p>
              {score.matched_required.length === 0 ? (
                <p className="sheet-prose">
                  Ingen kravkompetens i annonsen matchar din CV-session direkt.
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
                <span className="label gap">Gap</span>
                <span className="count">
                  {score.missing_required.length + score.missing_preferred.length}
                </span>
              </p>
              {score.missing_required.length === 0 && score.missing_preferred.length === 0 ? (
                <p className="sheet-prose">Inga uppenbara gap.</p>
              ) : (
                <ul>
                  {score.missing_required.map((s) => (
                    <li key={s}>{s} · krav</li>
                  ))}
                  {score.missing_preferred.map((s) => (
                    <li key={`p-${s}`}>{s} · önskvärt</li>
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
            <span>Annonsens text</span>
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
        Listan över matchade och saknade kompetenser kommer från
        Arbetsförmedlingens kompetenstaxonomi som finns i annonsen. Vi
        infererar inte krav som inte är explicit angivna.
      </aside>
    </main>
  );
}
