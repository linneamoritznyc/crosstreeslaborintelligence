interface Props {
  variant?: "score" | "graph" | "chat" | "roi";
}

const DISCLAIMERS: Record<NonNullable<Props["variant"]>, string> = {
  score:
    "Detta är en AI-genererad rekommendation. Poängen baseras på kompetensöverlapp och ersätter inte en professionell karriärbedömning.",
  graph:
    "Karriärövergångarna är AI-genererade rekommendationer baserade på Arbetsförmedlingens substitutabilitetsdata. Beslut fattas av användaren.",
  chat:
    "Detta är en AI-genererad analys. Beslut fattas av ansvarig handläggare vid Kompetensrådet.",
  roi:
    "ROI-beräkningen är en uppskattning baserad på SCB- och AF-data. Antaganden visas explicit. Beslut fattas av ansvarig handläggare.",
};

export default function AIActDisclaimer({ variant = "score" }: Props) {
  return (
    <aside
      role="note"
      aria-label="AI Act-förbehåll"
      style={{
        fontSize: "0.85rem",
        color: "#555",
        borderLeft: "3px solid #ccc",
        padding: "0.4rem 0.75rem",
        margin: "0.75rem 0",
      }}
    >
      <strong>AI Act-förbehåll:</strong> {DISCLAIMERS[variant]}
    </aside>
  );
}
