interface Props {
  variant?: "score" | "graph" | "chat" | "roi";
}

const DISCLAIMERS: Record<NonNullable<Props["variant"]>, string> = {
  score:
    "Detta är en AI-genererad rekommendation. Poängen baseras på kompetensöverlapp och ersätter inte en professionell karriärbedömning.",
  graph:
    "Karriärövergångarna är AI-genererade rekommendationer baserade på Arbetsförmedlingens substitutabilitetsdata. Beslut fattas av användaren.",
  chat:
    "Detta är en AI-genererad analys. Beslut fattas av ansvarig handläggare vid Kompetensgrafen.",
  roi:
    "ROI-beräkningen är en uppskattning baserad på SCB- och AF-data. Antaganden visas explicit. Beslut fattas av ansvarig handläggare.",
};

export default function AIActDisclaimer({ variant = "score" }: Props) {
  return (
    <aside role="note" aria-label="AI Act-förbehåll">
      <strong>AI Act-förbehåll:</strong> {DISCLAIMERS[variant]}
    </aside>
  );
}
