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
      `/kompetensradet/sektorer/${sektor}`
    );
    sektorNamn = sektorData.namn;
  } catch {
    // fortsätt med slug som rubrik
  }

  return (
    <main style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1rem" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
        <Link href="/">← Tillbaka till sektorvalet</Link>
      </nav>
      <h1>Analys: {sektorNamn}</h1>
      <p style={{ color: "#444" }}>
        Steg 1 av 5 — välj kommun eller yrke nedan för att fortsätta till
        omställningsanalys, utbildningsgap och ROI.
      </p>

      <LanskartaD3 sektor={sektor} />
      <BristTabell sektor={sektor} />

      <nav style={{ marginTop: "1.5rem" }}>
        <h2>Nästa steg</h2>
        <ul>
          <li>
            <Link href="/omstallning">→ Omställningsanalys per yrke</Link>
          </li>
          <li>
            <Link href={`/roi?sektor=${sektor}`}>→ ROI-kalkylator för sektorn</Link>
          </li>
          <li>
            <Link href={`/export?sektor=${sektor}`}>→ Exportera PDF-rapport</Link>
          </li>
        </ul>
      </nav>

      <AIActDisclaimer variant="graph" />
    </main>
  );
}
