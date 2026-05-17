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
    data = await apiClient<OmstallningsYrke[]>("/kompetensradet/omstallning");
  } catch {
    // Visar tomt tillstånd om SCB-data saknas
  }

  if (data.length === 0) {
    return (
      <section aria-label="Omställningsyrken">
        <h2>Yrken med hög substituerbarhet</h2>
        <div className="alert alert-empty">
          Bristdata från SCB saknas — kontrollera SCB_API_BASE och länskod.
          Grafen i Neo4j innehåller substituerbarhetskanter som kan visas här
          när SCB-integrationen är klar.
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Omställningsyrken">
      <h2>Yrken med hög substituerbarhet</h2>
      <div className="sektor-grid">
        {data.map((yrke) => {
          const score = Math.round(yrke.substitutability_score * 100);
          return (
            <div key={yrke.occupation_id} className="card">
              <h3>{yrke.occupation_name}</h3>
              <div className="score-bar" style={{ margin: "0.5rem 0" }}>
                <div className="score-bar-fill" style={{ width: `${score}%` }} />
              </div>
              <div className="card-sub">{score}% substituerbarhet</div>
              {yrke.rekommenderade_utbildningar.length > 0 && (
                <ul style={{ marginTop: "0.75rem", paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
                  {yrke.rekommenderade_utbildningar.map((u, i) => (
                    <li key={i}>{u.titel} — {u.leverantor}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
