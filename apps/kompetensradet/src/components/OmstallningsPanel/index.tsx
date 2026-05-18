import { apiClient } from "@/lib/api-client";
import AIDisclaimer from "@/components/AIDisclaimer";
import SourceTag from "@/components/SourceTag";

interface OmstallningsYrke {
  occupation_id: string;
  occupation_name: string;
  substitutability_score: number;
  rekommenderade_utbildningar: Array<{ titel: string; leverantor: string }>;
}

function scoreVariant(score: number) {
  if (score >= 0.7) return "danger";
  if (score >= 0.4) return "warning";
  return "success";
}

export default async function OmstallningsPanel() {
  let data: OmstallningsYrke[] = [];
  let error: string | null = null;
  try {
    data = await apiClient<OmstallningsYrke[]>("/kompetensradet/omstallning?sektor=alla");
  } catch (err) {
    error = err instanceof Error ? err.message : "Kunde inte hämta omställningsdata";
  }

  return (
    <section className="card" aria-label="Omställningsyrken">
      <div className="card-header">
        <div>
          <span className="pill">Steg 2 av 5 · Omställning</span>
          <h2 className="card-title" style={{ marginTop: 8 }}>
            Yrken med hög substituerbarhet
          </h2>
          <p style={{ margin: 0, color: "var(--color-ink-soft)" }}>
            Substituerbarhet beräknas via Personalized PageRank på AF
            substitutabilitetsdata. Högt värde = stort omställningsbehov.
          </p>
        </div>
        {data.length > 0 && <span className="pill">{data.length} yrken</span>}
      </div>

      {error ? (
        <div className="empty-state" role="alert">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <p>Inga omställningsyrken identifierade i datakällan ännu.</p>
          <small>
            Data hämtas från AF substitutabilitetsdataset, uppdateras kvartalsvis.
          </small>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {data.map((yrke) => {
            const procent = Math.round(yrke.substitutability_score * 100);
            return (
              <li
                key={yrke.occupation_id}
                style={{
                  padding: "var(--space-md)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-soft)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-md)",
                  }}
                >
                  <strong>{yrke.occupation_name}</strong>
                  <span className={`pill ${scoreVariant(yrke.substitutability_score)}`}>
                    Substituerbarhet: {procent}%
                  </span>
                </div>
                {yrke.rekommenderade_utbildningar.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <small style={{ color: "var(--color-ink-muted)" }}>
                      Rekommenderade omställningsvägar:
                    </small>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: 20 }}>
                      {yrke.rekommenderade_utbildningar.map((u, i) => (
                        <li key={i} style={{ fontSize: "0.875rem" }}>
                          {u.titel} — {u.leverantor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <SourceTag source="AF Substitutabilitetsdata · Neo4j Personalized PageRank" />
      <AIDisclaimer variant="short" />
    </section>
  );
}
