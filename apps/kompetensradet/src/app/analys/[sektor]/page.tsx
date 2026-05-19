import BristTabell from "@/components/BristTabell";
import LanskartaD3 from "@/components/LanskartaD3";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ sektor: string }>;
}

export default async function AnalysPage({ params }: Props) {
  const { sektor } = await params;

  let sektorNamn = sektor.charAt(0).toUpperCase() + sektor.slice(1);
  try {
    const sektorData = await apiClient<{ namn: string }>(`/kompetensradet/sektorer/${sektor}`);
    sektorNamn = sektorData.namn ?? sektorNamn;
  } catch {
    // API unavailable — use slug as fallback name
  }

  return (
    <main>
      <h1>Analys: {sektorNamn}</h1>
      <LanskartaD3 sektor={sektor} />
      <BristTabell sektor={sektor} />
    </main>
  );
}
