import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface Sektor {
  sektor: string;
  namn: string;
  antal_annonser: number;
  toppyrken: Array<{ yrke: string }>;
}

interface Overview {
  region: string;
  lan_kod: string;
  totalt_annonser: number;
  sektorer: Sektor[];
}

export default async function OverviewPage() {
  let data: Overview | null = null;
  try {
    data = await apiClient<Overview>("/kompetensradet/region/jonkoping/overview");
  } catch {
    // API kan vara nere vid första deploy — visar tomt tillstånd
  }

  const sektorer = data?.sektorer ?? [];
  const totalt = data?.totalt_annonser ?? 0;
  const aktivaSektorer = sektorer.filter((s) => s.antal_annonser > 0).length;

  return (
    <main>
      <div className="page-header">
        <h1>Regional arbetsmarknadsöversikt</h1>
        <p>Aktuell data för Jönköpings län — uppdateras varje timme från Platsbanken</p>
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-label">Lediga tjänster</div>
          <div className="card-value">{totalt.toLocaleString("sv-SE")}</div>
          <div className="card-sub">i Jönköpings län just nu</div>
        </div>
        <div className="card">
          <div className="card-label">Sektorer analyserade</div>
          <div className="card-value">{sektorer.length}</div>
          <div className="card-sub">{aktivaSektorer} med aktiva annonser</div>
        </div>
        <div className="card">
          <div className="card-label">Datakälla</div>
          <div className="card-value" style={{ fontSize: "1rem", paddingTop: "0.35rem" }}>Platsbanken</div>
          <div className="card-sub">AF JobSearch API, region 06</div>
        </div>
      </div>

      {sektorer.length === 0 && (
        <div className="alert alert-empty">
          Hämtar data — kontrollera att API:n är igång och att NEXT_PUBLIC_API_URL är satt.
        </div>
      )}

      <h2>Sektorer</h2>
      <div className="sektor-grid">
        {sektorer.map((s) => (
          <Link key={s.sektor} href={`/analys/${s.sektor}`} className="sektor-card">
            <h3>{s.namn}</h3>
            <div className="antal">{s.antal_annonser.toLocaleString("sv-SE")} annonser</div>
            {s.toppyrken.length > 0 && (
              <div className="yrken">
                {s.toppyrken.map((y) => y.yrke).join(" · ")}
              </div>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
