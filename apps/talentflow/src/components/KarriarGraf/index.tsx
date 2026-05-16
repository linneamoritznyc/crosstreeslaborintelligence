import { apiClient } from "@/lib/api-client";

interface CareerNode {
  id: string;
  label: string;
  type: "current" | "adjacent" | "target";
}

interface CareerEdge {
  from: string;
  to: string;
  weight: number;
}

interface CareerGraph {
  nodes: CareerNode[];
  edges: CareerEdge[];
}

interface Props {
  sessionId: string;
}

export default async function KarriarGraf({ sessionId }: Props) {
  const graph = await apiClient<CareerGraph>(`/recommend/career-graph?session=${sessionId}`);

  return (
    <section aria-label="Karriärkarta">
      <h2>Möjliga karriärvägar</h2>
      <ul>
        {graph.nodes
          .filter((n) => n.type !== "current")
          .map((node) => (
            <li key={node.id}>{node.label}</li>
          ))}
      </ul>
    </section>
  );
}
