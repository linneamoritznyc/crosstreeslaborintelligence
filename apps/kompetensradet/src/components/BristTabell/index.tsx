import { apiClient } from "@/lib/api-client";
import DataLabel from "@/components/DataLabel";

interface BristYrke {
  occupation_id: string;
  occupation_name: string;
  brist_index: number;
  antal_annonser: number;
  prognos: string;
  ssyk_code?: string;
}

interface Props {
  sektor: string;
}

export default async function BristTabell({ sektor }: Props) {
  let data: BristYrke[];
  try {
    data = await apiClient<BristYrke[]>(`/kompetensradet/brist?sektor=${sektor}`);
  } catch {
    return (
      <section aria-label="Bristyrken">
        <h2>Bristyrken i sektorn</h2>
        <p>
          <em>Bristdata under validering — försök igen om en stund.</em>
        </p>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section aria-label="Bristyrken">
        <h2>Bristyrken i sektorn</h2>
        <p>
          <em>Inga yrken hittades för denna sektor i grafen.</em>
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Bristyrken">
      <h2>Yrken i sektorn — rankade efter aktuell annonsvolym</h2>
      <table>
        <thead>
          <tr>
            <th>Yrke</th>
            <th>SSYK</th>
            <th>Annonser nu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((rad) => (
            <tr key={rad.occupation_id}>
              <td>{rad.occupation_name}</td>
              <td>{rad.ssyk_code ?? "—"}</td>
              <td>{rad.antal_annonser}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <DataLabel
        source="Neo4j yrkesgraf + AF Platsbanken (Jönköpings län)"
        date={new Date().toLocaleDateString("sv-SE")}
      />
    </section>
  );
}
