interface Props {
  /** Kort variant används vid varje algoritmisk utdata; lång under sektioner. */
  variant?: "short" | "long";
  /** Frivillig anpassad text. Faller annars tillbaka till AI Act-standardtext. */
  children?: React.ReactNode;
}

export default function AIDisclaimer({ variant = "short", children }: Props) {
  if (variant === "long") {
    return (
      <aside className="ai-disclaimer" role="note" aria-label="AI-förbehåll">
        <strong>AI-genererad analys</strong>
        {children ?? (
          <span>
            Detta är en AI-genererad rekommendation. Beslut fattas av ansvarig
            handläggare vid Kompetensrådet. Systemet är klassat som högrisk-AI
            enligt EU 2024/1689 Artikel 6 (Bilaga III punkt 4).
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
