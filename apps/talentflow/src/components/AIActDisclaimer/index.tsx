interface Props {
  variant?: "score" | "graph" | "chat" | "roi" | "intro";
}

const DISCLAIMERS: Record<NonNullable<Props["variant"]>, string> = {
  intro:
    "Det här systemet använder AI för att analysera dina yrkeskompetenser och generera karriärrekommendationer. Det är ett AI-system med hög risk enligt EU:s AI-förordning (EU 2024/1689). Resultaten är rekommendationer, inte beslut. Du fattar alltid det slutliga beslutet om dina ansökningar och din karriär.",
  score:
    "Detta är en AI-genererad rekommendation. Poängen baseras på kompetensöverlapp och ersätter inte en professionell karriärbedömning.",
  graph:
    "Karriärövergångarna är AI-genererade rekommendationer baserade på Arbetsförmedlingens substitutabilitetsdata. Beslut fattas av användaren.",
  chat:
    "Detta är en AI-genererad analys. Beslut fattas av användaren.",
  roi:
    "ROI-beräkningen är en uppskattning baserad på SCB- och AF-data.",
};

export default function AIActDisclaimer({ variant = "score" }: Props) {
  return (
    <aside role="note" aria-label="AI Act-förbehåll">
      <strong>AI Act-förbehåll —</strong> {DISCLAIMERS[variant]}
    </aside>
  );
}
