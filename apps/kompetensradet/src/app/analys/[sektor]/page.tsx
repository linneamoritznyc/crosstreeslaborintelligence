import Link from "next/link";
import BristTabell from "@/components/BristTabell";
import LanskartaD3 from "@/components/LanskartaD3";
import AIDisclaimer from "@/components/AIDisclaimer";
import { apiClient } from "@/lib/api-client";

interface SektorMeta {
  id: string;
  namn: string;
  beskrivning: string;
  kallor: string[];
}

interface Props {
  params: Promise<{ sektor: string }>;
}

async function fetchSektor(sektor: string): Promise<SektorMeta | null> {
  try {
    return await apiClient<SektorMeta>(`/kompetensradet/sektorer/${sektor}`);
  } catch {
    return null;
  }
}

export default async function AnalysPage({ params }: Props) {
  const { sektor } = await params;
  const meta = await fetchSektor(sektor);

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <span className="pill">Steg 1 av 5 · Branschanalys</span>
            <h1 style={{ margin: "8px 0 4px" }}>{meta?.namn ?? sektor}</h1>
            {meta?.beskrivning && (
              <p style={{ margin: 0, color: "var(--color-ink-soft)" }}>
                {meta.beskrivning}
              </p>
            )}
          </div>
          <Link href="/omstallning" className="btn-link secondary">
            Nästa: Omställning →
          </Link>
        </div>
      </section>

      <LanskartaD3 sektor={sektor} />
      <BristTabell sektor={sektor} />
      <AIDisclaimer variant="long" />
    </>
  );
}
