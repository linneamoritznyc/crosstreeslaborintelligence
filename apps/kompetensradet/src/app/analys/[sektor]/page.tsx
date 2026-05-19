import BristTabell from "@/components/BristTabell";
import LanskartaD3 from "@/components/LanskartaD3";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

interface Trender {
  sektor: string;
  antal_annonser: number;
  toppyrken: Array<{ yrke: string }>;
}

interface Props {
  params: Promise<{ sektor: string }>;
}

const SEKTOR_NAMN: Record<string, string> = {
  industri: "Industri",
  vård: "Vård och omsorg",
  it: "IT och digitalisering",
  bygg: "Bygg och anläggning",
  transport: "Transport och logistik",
  handel: "Handel",
};

export default async function AnalysPage({ params }: Props) {
  const { sektor } = await params;
  const namn = SEKTOR_NAMN[sektor] ?? sektor;

  let trender: Trender | null = null;
  try {
    trender = await apiClient<Trender>(`/trends?sektor=${sektor}`);
  } catch {
    // Visar sidan ändå
  }

  return (
    <main>
      <div className="page-header">
        <h1>{namn}</h1>
        <p>
          {trender
            ? `${trender.antal_annonser.toLocaleString("sv-SE")} aktiva annonser i Jönköpings län`
            : "Hämtar annonsdata…"}
        </p>
      </div>

      {trender && trender.toppyrken.length > 0 && (
        <div className="cards" style={{ marginBottom: "2rem" }}>
          {trender.toppyrken.slice(0, 4).map((y, i) => (
            <div key={i} className="card">
              <div className="card-label">Efterfrågat yrke</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "0.25rem" }}>
                {y.yrke}
              </div>
            </div>
          ))}
        </div>
      )}

      <LanskartaD3 sektor={sektor} />
      <div style={{ marginTop: "2rem" }}>
        <BristTabell sektor={sektor} />
      </div>
    </main>
  );
}
