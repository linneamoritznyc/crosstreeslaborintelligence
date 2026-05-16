import { apiClient } from "@/lib/api-client";

interface KompetensgapData {
  target_occupation: string;
  gaps: Array<{ skill_id: string; skill_name: string; priority: "hög" | "medel" | "låg" }>;
  education_suggestions: Array<{ title: string; provider: string; url: string }>;
}

interface Props {
  sessionId: string;
  targetOccupationId: string;
}

export default async function KompetensgapPanel({ sessionId, targetOccupationId }: Props) {
  const data = await apiClient<KompetensgapData>(
    `/recommend/gaps?session=${sessionId}&target=${targetOccupationId}`
  );

  return (
    <section aria-label="Kompetensgap">
      <h2>Väg till {data.target_occupation}</h2>
      <h3>Kompetenser att utveckla</h3>
      <ul>
        {data.gaps.map((g) => (
          <li key={g.skill_id}>
            {g.skill_name} — prioritet: {g.priority}
          </li>
        ))}
      </ul>
      {data.education_suggestions.length > 0 && (
        <>
          <h3>Utbildningsförslag</h3>
          <ul>
            {data.education_suggestions.map((e) => (
              <li key={e.url}>
                <a href={e.url} target="_blank" rel="noopener noreferrer">
                  {e.title} ({e.provider})
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
