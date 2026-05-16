import { apiClient } from "@/lib/api-client";

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

export default async function BristTabell({ sektor }: Props) {
  const data = await apiClient<BristYrke[]>(`/kompetensradet/brist?sektor=${sektor}`);

  return (
    <section aria-label="Bristyrken">
      <h2>Bristyrken i sektorn</h2>
      <table>
        <thead>
          <tr>
            <th>Yrke</th>
            <th>Bristindex</th>
            <th>Antal annonser</th>
            <th>Prognos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((rad) => (
            <tr key={rad.occupation_id}>
              <td>{rad.occupation_name}</td>
              <td>{rad.brist_index.toFixed(2)}</td>
              <td>{rad.antal_annonser}</td>
              <td>{rad.prognos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
