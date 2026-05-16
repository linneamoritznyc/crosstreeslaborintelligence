import { apiClient } from "@/lib/api-client";
import type { MatchResult } from "../../../../../../../../libs/shared-types/match";

interface Props {
  sessionId: string;
  jobId: string;
}

export default async function FitScoreKort({ sessionId, jobId }: Props) {
  const match = await apiClient<MatchResult>(`/match/score?session=${sessionId}&job=${jobId}`);

  const { score, confidence_interval, missing_required } = match;

  return (
    <article aria-label={`Matchningspoäng: ${score}%`}>
      <h2>Matchningspoäng</h2>
      <p>
        <strong>{score}%</strong>{" "}
        <small>
          (95% KI: {confidence_interval.low}–{confidence_interval.high}%)
        </small>
      </p>
      {missing_required.length > 0 && (
        <section>
          <h3>Kompetenser som saknas</h3>
          <ul>
            {missing_required.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
