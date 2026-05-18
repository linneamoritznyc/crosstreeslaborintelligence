import { apiClient } from "@/lib/api-client";
import SourceTag from "@/components/SourceTag";

interface BristYrke {
  occupation_id: string;
  occupation_name: string;
  brist_index: number;
  antal_annonser: number;
  prognos: "ökande" | "stabil" | "minskande";
}

interface Props {
  sektor: string;
}

function PrognosPill({ prognos }: { prognos: BristYrke["prognos"] }) {
  if (prognos === "ökande") return <span className="pill warning">↑ {prognos}</span>;
  if (prognos === "minskande") return <span className="pill success">↓ {prognos}</span>;
  return <span className="pill">→ {prognos}</span>;
}

export default async function BristTabell({ sektor }: Props) {
  let data: BristYrke[] = [];
  let error: string | null = null;
  try {
    data = await apiClient<BristYrke[]>(`/kompetensradet/brist?sektor=${sektor}`);
  } catch (err) {
    error = err instanceof Error ? err.message : "Kunde inte hämta bristdata";
  }

  return (
    <section className="card" aria-label="Bristyrken">
      <div className="card-header">
        <h2 className="card-title">Bristyrken i sektorn</h2>
        <span className="pill">{data.length} yrken</span>
      </div>

      {error ? (
        <div className="empty-state" role="alert">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          Inga bristyrken hittades för denna sektor just nu.
          <br />
          <small>Data uppdateras dagligen från AF Platsbanken.</small>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Yrke</th>
              <th style={{ textAlign: "right" }}>Bristindex</th>
              <th style={{ textAlign: "right" }}>Live-annonser</th>
              <th>Prognos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((rad) => (
              <tr key={rad.occupation_id}>
                <td>{rad.occupation_name}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {rad.brist_index.toFixed(2)}
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {rad.antal_annonser.toLocaleString("sv-SE")}
                </td>
                <td>
                  <PrognosPill prognos={rad.prognos} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SourceTag source="SCB AM0208 Lediga jobb och vakanser · AF Platsbanken" />
    </section>
  );
}
