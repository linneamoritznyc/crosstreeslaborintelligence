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
      <section aria-label="Karriärkarta" style={{ marginTop: "1.5rem" }}>
        <h2>Möjliga karriärvägar</h2>
        <p className="body-t" style={{ fontStyle: "italic" }}>
          Grafdata under validering — försök igen om en stund.
        </p>
      </section>
    );
  }

  if (graph.nodes.length === 0) {
    return (
      <section aria-label="Karriärkarta" style={{ marginTop: "1.5rem" }}>
        <h2>Möjliga karriärvägar</h2>
        <p className="body-t" style={{ fontStyle: "italic" }}>
          Inga karriärvägar hittades. Kontrollera att grafdata är seedad.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Karriärkarta" style={{ marginTop: "1.5rem" }}>
      <h2>Möjliga karriärvägar</h2>
      <p className="body-t">Baserat på Arbetsförmedlingens substitutabilitetsdata.</p>
      <ul className="matches" style={{ marginTop: "1rem" }}>
        {graph.edges.slice(0, 20).map((edge) => {
          const from = graph.nodes.find((n) => n.id === edge.from)?.label ?? edge.from;
          const to = graph.nodes.find((n) => n.id === edge.to)?.label ?? edge.to;
          return (
            <li className="m-row" key={`${edge.from}-${edge.to}`}>
              <span className="m-name">{from} → {to}</span>
              <span className="m-pct">
                {edge.score !== null ? `${edge.score}%` : "—"}
              </span>
            </li>
          );
        })}
      </ul>
      <DataLabel source="AF Substitutabilitetsdata · Neo4j" />
    </section>
  );
}
