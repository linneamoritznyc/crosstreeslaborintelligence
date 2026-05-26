import { apiClient } from "@/lib/api-client";
import DataLabel from "@/components/DataLabel";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface OmstallningsYrke {
  occupation_id: string;
  occupation_name: string;
  substitutability_score: number;
  target_occupation_name?: string;
  rekommenderade_utbildningar: Array<{ titel: string; leverantor: string }>;
}

interface OmstallningsRespons {
  kallor: OmstallningsYrke[];
  datakalla: string;
  target_occupation_name?: string;
}

interface Props {
  target?: string;
}

export default async function OmstallningsPanel({ target }: Props) {
  let data: OmstallningsRespons;
  try {
    const path = target
      ? `/kompetensgrafen/omstallning?target=${target}`
      : "/kompetensgrafen/omstallning";
    data = await apiClient<OmstallningsRespons>(path);
  } catch {
    return (
      <section aria-label="Omställningsyrken">
        <h2>Omställningsanalys</h2>
        <p>
          <em>Grafdata under validering. Försök igen om en stund.</em>
        </p>
      </section>
    );
  }

  if (!data.kallor || data.kallor.length === 0) {
    return (
      <section aria-label="Omställningsyrken">
        <h2>Omställningsanalys</h2>
        <p>
          <em>Inga omställningskandidater hittades. Kontrollera att grafen är seedad.</em>
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Omställningsyrken">
      <h2>
        {data.target_occupation_name
          ? `Källyrken som kan ställas om till ${data.target_occupation_name}`
          : "Yrken med hög substituerbarhet i Jönköpings län"}
      </h2>
      <table>
        <thead>
          <tr>
            <th>Källyrke</th>
            {!target && <th>Möjligt målyrke</th>}
            <th>Substituerbarhet</th>
          </tr>
        </thead>
        <tbody>
          {data.kallor.map((yrke) => (
            <tr key={`${yrke.occupation_id}-${yrke.target_occupation_name ?? ""}`}>
              <td>{yrke.occupation_name}</td>
              {!target && <td>{yrke.target_occupation_name ?? "—"}</td>}
              <td>{(yrke.substitutability_score * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <DataLabel source={data.datakalla} />
      <AIActDisclaimer variant="graph" />
    </section>
  );
}
