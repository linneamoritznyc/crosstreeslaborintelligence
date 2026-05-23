import Link from "next/link";
import BristTabell from "@/components/BristTabell";
import LanskartaD3 from "@/components/LanskartaD3";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import { apiClient } from "@/lib/api-client";

interface Props {
  params: Promise<{ sektor: string }>;
}

export default async function AnalysPage({ params }: Props) {
  const { sektor } = await params;

  let sektorNamn = sektor;
  try {
    const sektorData = await apiClient<{ namn: string }>(
      `/kompetensgrafen/sektorer/${sektor}`
    );
    sektorNamn = sektorData.namn;
  } catch {
    // fortsätt med slug
  }

  return (
    <main className="page">
      <nav style={{ paddingTop: "0.5rem", marginBottom: "1rem" }}>
        <small className="data">
          <Link href="/">← TILLBAKA TILL SEKTORVALET</Link>
        </small>
      </nav>
      <h1>Analys — {sektorNamn}</h1>
      <p>
        Steg 1 av 5 — välj kommun eller yrke nedan för att fortsätta till
        omställningsanalys, utbildningsgap och ROI.
      </p>

      <LanskartaD3 sektor={sektor} />
      <BristTabell sektor={sektor} />

      <h2>Nästa steg</h2>
      <ul>
        <li>
          <Link href="/omstallning">→ Omställningsanalys per yrke</Link>
        </li>
        <li>
          <Link href={`/roi?sektor=${sektor}`}>→ ROI-kalkyl för sektorn</Link>
        </li>
        <li>
          <Link href={`/export?sektor=${sektor}`}>→ Exportera PDF-rapport</Link>
        </li>
      </ul>

      <AIActDisclaimer variant="graph" />
    </main>
  );
}
