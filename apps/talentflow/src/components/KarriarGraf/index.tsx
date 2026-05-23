import { apiClient } from "@/lib/api-client";
import DataLabel from "@/components/DataLabel";

interface CareerNode {
  id: string;
  label: string;
  type: "current" | "adjacent" | "target";
}

interface CareerEdge {
  from: string;
  to: string;
  score: number | null;
  direction: string | null;
}

interface CareerGraph {
  nodes: CareerNode[];
  edges: CareerEdge[];
}

interface Props {
  sessionId: string;
}

export default async function KarriarGraf({ sessionId }: Props) {
  let graph: CareerGraph;
  try {
    graph = await apiClient<CareerGraph>(
      `/recommend/career-graph?session=${sessionId}`
    );
  } catch {
    return (
      <section aria-label="Karriärkarta">
        <h2>Möjliga karriärvägar</h2>
        <p>
          <em>Grafdata under validering — försök igen om en stund.</em>
        </p>
      </section>
    );
  }

  if (graph.nodes.length === 0) {
    return (
      <section aria-label="Karriärkarta">
        <h2>Möjliga karriärvägar</h2>
        <p>
          <em>Inga karriärvägar hittades. Kontrollera att grafdata är seedad.</em>
        </p>
      </section>
    );
  }

  const adjacents = graph.nodes.filter((n) => n.type !== "current");

  return (
    <section aria-label="Karriärkarta">
      <h2>Möjliga karriärvägar</h2>
      <p>Baserat på Arbetsförmedlingens substitutabilitetsdata.</p>
      <table>
        <thead>
          <tr>
            <th>Från</th>
            <th>Till</th>
            <th>Substituerbarhet</th>
          </tr>
        </thead>
        <tbody>
          {graph.edges.slice(0, 30).map((edge) => {
            const from = graph.nodes.find((n) => n.id === edge.from)?.label ?? edge.from;
            const to = graph.nodes.find((n) => n.id === edge.to)?.label ?? edge.to;
            return (
              <tr key={`${edge.from}-${edge.to}`}>
                <td>{from}</td>
                <td>{to}</td>
                <td>{edge.score !== null ? `${edge.score}%` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <details>
        <summary>{adjacents.length} möjliga målyrken</summary>
        <ul>
          {adjacents.map((node) => (
            <li key={node.id}>{node.label}</li>
          ))}
        </ul>
      </details>
      <DataLabel source="AF Substitutabilitetsdata + Neo4j substitutabilitetsgraf" />
    </section>
  );
}
