import { apiClient } from "@/lib/api-client";

interface OmstallningsYrke {
  occupation_id: string;
  occupation_name: string;
  substitutability_score: number;
  rekommenderade_utbildningar: Array<{ titel: string; leverantor: string }>;
}

export default async function OmstallningsPanel() {
  let data: OmstallningsYrke[] = [];
  try {
    data = await apiClient<OmstallningsYrke[]>("/kompetensradet/omstallning?sektor=alla");
  } catch {
    // API unavailable — show honest empty state
  }

  return (
    <section aria-label="Omställningsyrken">
      <h2>Yrken med hög substituerbarhet</h2>
      {data.length === 0 ? (
        <p className="empty-state">
          Omställningsdata är inte tillgänglig just nu.
          Data hämtas från SCB och Arbetsförmedlingen.
        </p>
      ) : (
        <ul>
          {data.map((yrke) => (
            <li key={yrke.occupation_id}>
              <strong>{yrke.occupation_name}</strong>{" "}
              (substituerbarhet: {(yrke.substitutability_score * 100).toFixed(0)}%)
              {yrke.rekommenderade_utbildningar.length > 0 && (
                <ul>
                  {yrke.rekommenderade_utbildningar.map((u, i) => (
                    <li key={i}>
                      {u.titel} — {u.leverantor}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
