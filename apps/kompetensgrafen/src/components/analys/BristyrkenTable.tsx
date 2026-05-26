import { apiClient } from "@/lib/api-client";

interface TopOccupation {
  rank: number;
  name: string;
  ssyk_code: string;
  shortage_pct: number;
  antal_annonser: number;
}

interface Props { sektor: string }

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function BristyrkenTable({ sektor }: Props) {
  let rows: TopOccupation[];
  try {
    rows = await apiClient<TopOccupation[]>(`/kompetensgrafen/top-shortage-occupations?sektor=${sektor}`);
  } catch {
    rows = [];
  }

  return (
    <section className="analys-section" style={{ paddingTop: 48 }}>
      <p className="rust-eyebrow">TOPP 10 BRISTYRKEN I SEKTORN</p>
      <h2 className="analys-h2">BRISTYRKEN</h2>
      <p className="analys-subhead" style={{ marginBottom: 32 }}>
        De yrken inom sektorn där regionen har störst kompetensbrist.
      </p>

      {rows.length === 0 ? (
        <p className="body-t" style={{ fontStyle: "italic", color: "var(--muted)" }}>
          Bristdata för denna sektor är inte tillgänglig för tillfället.
        </p>
      ) : (
        <div style={{ borderTop: "0.5px solid var(--border-faint)" }}>
          {rows.map(row => (
            <a
              key={row.rank}
              href={`/omstallning?target=${encodeURIComponent(row.ssyk_code)}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div className="brist-row">
                <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700,
                  fontSize: 11, color: "var(--rust)", width: 32, flexShrink: 0 }}>
                  {pad(row.rank)}
                </span>
                <span style={{ fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontSize: 16, color: "var(--ink)", flex: 1, padding: "0 16px" }}>
                  {row.name}
                </span>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                  color: "var(--muted)", letterSpacing: "0.08em", width: 90 }}>
                  SSYK {row.ssyk_code}
                </span>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700,
                  fontSize: 14, color: "var(--rust)", width: 60, textAlign: "right" }}>
                  {row.shortage_pct}%
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      <p className="coord" style={{ marginTop: 16 }}>
        KÄLLA: NEO4J YRKESGRAF + AF PLATSBANKEN · JÖNKÖPINGS LÄN
      </p>
    </section>
  );
}
