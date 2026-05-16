import BristTabell from "@/components/BristTabell";
import LanskartaD3 from "@/components/LanskartaD3";
import { apiClient } from "@/lib/api-client";

interface Props {
  params: Promise<{ sektor: string }>;
}

export default async function AnalysPage({ params }: Props) {
  const { sektor } = await params;
  const sektorData = await apiClient<{ namn: string }>(`/kompetensradet/sektorer/${sektor}`);

  return (
    <main>
      <h1>Analys: {sektorData.namn}</h1>
      <LanskartaD3 sektor={sektor} />
      <BristTabell sektor={sektor} />
    </main>
  );
}
