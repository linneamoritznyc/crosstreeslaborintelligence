interface Props {
  variant?: "short" | "long";
  children?: React.ReactNode;
}

export default function AIDisclaimer({ variant = "short", children }: Props) {
  if (variant === "long") {
    return (
      <aside className="ai-disclaimer" role="note" aria-label="AI-förbehåll">
        <strong>AI-genererad analys</strong>
        {children ?? (
          <span>
            Resultaten är rekommendationer — inte beslut. Du fattar alltid det
            slutliga beslutet om dina ansökningar och din karriär. Systemet är
            klassat som högrisk-AI enligt EU 2024/1689 Artikel 6 (Bilaga III
            punkt 4).
          </span>
        )}
      </aside>
    );
  }

  return (
    <p className="ai-disclaimer" role="note">
      <strong>AI-genererad</strong>
      {children ?? "Rekommendation, inte beslut. EU 2024/1689 Artikel 14."}
    </p>
  );
}
