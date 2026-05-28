import { apiClient } from "@/lib/api-client";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface OmstallningsYrke {
  occupation_id: string;
  occupation_name: string;
  substitutability_score: number;
  target_occupation_name?: string;
}

interface OmstallningsRespons {
  kallor: OmstallningsYrke[];
  datakalla: string;
  target_occupation_name?: string;
}

interface Props { target?: string }

function pad(n: number) { return String(n).padStart(2, "0"); }

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "var(--rust)" : pct >= 50 ? "var(--ink-soft)" : "var(--muted)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 80, height: 3, background: "var(--border-faint)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
      <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700,
        fontSize: 13, color }}>{pct}%</span>
    </div>
  );
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
      <p className="body-t" style={{ fontStyle: "italic", color: "var(--muted)" }}>
        Substitutabilitetsdata under validering. Försök igen om en stund.
      </p>
    );
  }

  if (!data.kallor || data.kallor.length === 0) {
    return (
      <p className="body-t" style={{ fontStyle: "italic", color: "var(--muted)" }}>
        Inga omställningskandidater hittades för valt yrke.
      </p>
    );
  }

  const headline = data.target_occupation_name
    ? `Källyrken som kan ställas om till ${data.target_occupation_name}`
    : "Yrken med hög substituerbarhet i Jönköpings län";

  return (
    <div>
      <p className="rust-eyebrow" style={{ marginBottom: 6 }}>SUBSTITUTABILITETSANALYS · ESCO-TAXONOMIN</p>
      <h2 style={{ fontFamily: "'Alumni Sans Condensed', Impact, sans-serif", fontWeight: 900,
        fontSize: 32, textTransform: "uppercase", color: "var(--ink)", margin: "0 0 8px", lineHeight: 1 }}>
        {headline.toUpperCase()}
      </h2>
      <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 15,
        color: "var(--ink-soft)", margin: "0 0 28px" }}>
        Procentvärdet anger andelen gemensamma ESCO-kompetenser med målyrket.
      </p>

      <div style={{ borderTop: "0.5px solid var(--border-faint)" }}>
        {data.kallor.map((yrke, i) => (
          <div key={`${yrke.occupation_id}-${yrke.target_occupation_name ?? ""}`}
            style={{ display: "flex", alignItems: "center", padding: "14px 0",
              borderBottom: "0.5px solid var(--border-faint)", gap: 16 }}>
            <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700,
              fontSize: 11, color: "var(--rust)", width: 28, flexShrink: 0 }}>
              {pad(i + 1)}
            </span>
            <span style={{ fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: 15, color: "var(--ink)", flex: 1 }}>
              {yrke.occupation_name}
            </span>
            {!target && yrke.target_occupation_name && (
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                color: "var(--muted)", letterSpacing: "0.06em", flexShrink: 0 }}>
                {"→"} {yrke.target_occupation_name}
              </span>
            )}
            <ScoreBar score={yrke.substitutability_score} />
          </div>
        ))}
      </div>

      <p className="coord" style={{ marginTop: 12 }}>
        KÄLLA: {data.datakalla ?? "NEO4J YRKESGRAF + ESCO-TAXONOMIN"} · JÖNKÖPINGS LÄN
      </p>

      <div style={{ marginTop: 20 }}>
        <AIActDisclaimer variant="graph" />
      </div>
    </div>
  );
}
