import { apiClient } from "@/lib/api-client";
import DataLabel from "@/components/DataLabel";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface ConfidenceInterval {
  low: number;
  high: number;
  method: string;
}

interface MatchResult {
  score: number;
  missing_required: string[];
  missing_preferred: string[];
  matched_required: string[];
  confidence_interval: ConfidenceInterval;
}

interface Props {
  sessionId: string;
  jobId: string;
}

export default async function FitScoreKort({ sessionId, jobId }: Props) {
  let match: MatchResult;
  try {
    match = await apiClient<MatchResult>(
      `/match/score?session=${sessionId}&job=${jobId}`
    );
  } catch {
    return null;
  }

  const { score, confidence_interval, missing_required, matched_required } = match;

  return (
    <article aria-label={`Matchningspoäng: ${score}%`}>
      <h2>Matchningspoäng</h2>
      <p className="body-t">
        <strong style={{ fontSize: "1.5rem" }}>{score}%</strong>{" "}
        <span className="coord">
          95% Wilson-KI: {confidence_interval.low}–{confidence_interval.high}%
        </span>
      </p>
      {matched_required.length > 0 && (
        <>
          <h3>Matchade kompetenser</h3>
          <ul className="matches" style={{ paddingLeft: 0 }}>
            {matched_required.map((s) => (
              <li className="m-row" key={s}>
                <span className="m-name">{s}</span>
                <span className="m-pct" style={{ fontSize: "11px" }}>✓</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {missing_required.length > 0 && (
        <>
          <h3>Saknade kompetenser</h3>
          <ul className="matches" style={{ paddingLeft: 0 }}>
            {missing_required.map((s) => (
              <li className="m-row" key={s}>
                <span className="m-name" style={{ color: "var(--rust)" }}>{s}</span>
                <span className="m-pct" style={{ fontSize: "11px", color: "var(--rust)" }}>gap</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <DataLabel source="AF Platsbanken + AF kompetenstaxonomi" />
      <AIActDisclaimer variant="score" />
    </article>
  );
}
