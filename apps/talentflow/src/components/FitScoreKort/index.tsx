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
      <p>
        <strong>{score}%</strong>{" "}
        <small>
          (95% Wilson-KI: {confidence_interval.low}–{confidence_interval.high}%)
        </small>
      </p>
      {matched_required.length > 0 && (
        <section>
          <h3>Matchade kompetenser</h3>
          <ul>
            {matched_required.map((s) => (
              <li key={s} style={{ color: "#0a7d2c" }}>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}
      {missing_required.length > 0 && (
        <section>
          <h3>Saknade kompetenser</h3>
          <ul>
            {missing_required.map((s) => (
              <li key={s} style={{ color: "#b00020" }}>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}
      <DataLabel source="AF Platsbanken + AF kompetenstaxonomi" />
      <AIActDisclaimer variant="score" />
    </article>
  );
}
