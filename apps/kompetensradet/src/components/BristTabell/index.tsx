import { apiClient } from "@/lib/api-client";

interface BristYrke {
  occupation_id: string;
  occupation_name: string;
  brist_index: number;
  antal_annonser: number;
  prognos: "ökande" | "stabil" | "minskande";
}

const prognosKlass: Record<string, string> = {
  ökande: "tag tag-green",
  stabil: "tag tag-yellow",
  minskande: "tag tag-red",
};

interface Props {
  sektor: string;
}

export default async function BristTabell({ sektor }: Props) {
  let data: BristYrke[] = [];
  try {
    data = await apiClient<BristYrke[]>(`/kompetensradet/brist?sektor=${sektor}`);
  } catch {
    // SCB kan sakna data för sektorn
  }

  if (data.length === 0) {
    return (
      <section aria-label="Bristyrken">
        <h2>Bristyrken i sektorn</h2>
        <div className="alert alert-empty">
          Ingen bristdata från SCB för sektorn &ldquo;{sektor}&rdquo;.
          Data uppdateras när SCB AM0208-integrationen är konfigurerad.
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Bristyrken">
      <h2>Bristyrken i sektorn</h2>
      <table>
        <thead>
          <tr>
            <th>Yrke</th>
            <th>Bristindex</th>
            <th>Annonser</th>
            <th>Prognos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((rad) => (
            <tr key={rad.occupation_id}>
              <td>{rad.occupation_name}</td>
              <td>{rad.brist_index.toFixed(2)}</td>
              <td>{rad.antal_annonser.toLocaleString("sv-SE")}</td>
              <td>
                <span className={prognosKlass[rad.prognos] ?? "tag"}>
                  {rad.prognos}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
