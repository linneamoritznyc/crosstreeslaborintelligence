import { apiClient } from "@/lib/api-client";

interface SectorStats {
  employees: number;
  shortage_pct: number;
  forecast_year: number;
  source: string;
}

interface Props { sektor: string }

function fmt(n: number): string {
  return n.toLocaleString("sv-SE");
}

export default async function StatsBand({ sektor }: Props) {
  let stats: SectorStats;
  try {
    stats = await apiClient<SectorStats>(`/kompetensgrafen/sector-stats?sektor=${sektor}`);
  } catch {
    stats = { employees: 0, shortage_pct: 0, forecast_year: 2040, source: "" };
  }

  return (
    <div className="stats-band">
      <div className="stats-cell">
        <span className="rust-eyebrow">SYSSELSATTA · JÖNKÖPINGS LÄN</span>
        <div className="stats-val">
          {stats.employees > 0 ? fmt(stats.employees) : "—"}
        </div>
        <span className="stats-note">SCB Yrkesregistret, 2024</span>
      </div>
      <div className="stats-cell">
        <span className="rust-eyebrow">BRISTTAL · SEKTOR</span>
        <div className="stats-val rust">
          {stats.shortage_pct > 0 ? `${stats.shortage_pct}%` : "—"}
        </div>
        <span className="stats-note">AF Yrkesbarometern, 2026</span>
      </div>
      <div className="stats-cell">
        <span className="rust-eyebrow">PROGNOSHORISONT</span>
        <div className="stats-val">2040</div>
        <span className="stats-note">SCB Regionala prognoser 2025</span>
      </div>
    </div>
  );
}
