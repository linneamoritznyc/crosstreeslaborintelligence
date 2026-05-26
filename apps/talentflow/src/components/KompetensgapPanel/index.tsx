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

const PRIORITY_LABEL: Record<string, string> = {
  hög: "Hög",
  medel: "Medel",
  låg: "Låg",
};

export default async function KompetensgapPanel({ sessionId, targetOccupationId }: Props) {
  let data: KompetensgapData;
  try {
    data = await apiClient<KompetensgapData>(
      `/recommend/gaps?session=${sessionId}&target=${targetOccupationId}`
    );
  } catch {
    return (
      <section aria-label="Kompetensgap" style={{ marginTop: "1.5rem" }}>
        <h2>Kompetensgapanalys</h2>
        <p className="body-t" style={{ fontStyle: "italic" }}>
          Grafdata under validering — försök igen om en stund.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Kompetensgap" style={{ marginTop: "1.5rem" }}>
      <h2>Väg till {data.target_occupation}</h2>
      {data.gaps.length > 0 && (
        <>
          <h3>Kompetenser att utveckla</h3>
          <ul className="matches" style={{ paddingLeft: 0 }}>
            {data.gaps.map((g) => (
              <li className="m-row" key={g.skill_id}>
                <span className="m-name">{g.skill_name}</span>
                <span className="m-pct" style={{ fontSize: "11px" }}>
                  {PRIORITY_LABEL[g.priority] ?? g.priority}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {data.education_suggestions.length > 0 && (
        <>
          <h3>Utbildningsförslag</h3>
          <ul className="matches" style={{ paddingLeft: 0 }}>
            {data.education_suggestions.map((e) => (
              <li className="m-row" key={e.url}>
                <span className="m-name">
                  <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                    {e.title}
                  </a>
                </span>
                <span className="coord">{e.provider}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
