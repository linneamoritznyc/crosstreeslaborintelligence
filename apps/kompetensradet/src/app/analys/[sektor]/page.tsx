import BristTabell from "@/components/BristTabell";
import LanskartaD3 from "@/components/LanskartaD3";

const SEKTOR_NAMN: Record<string, string> = {
  industri: "Industri",
  vard: "Vård och omsorg",
  it: "IT och digitalisering",
  bygg: "Bygg och anläggning",
};

interface Props {
  params: Promise<{ sektor: string }>;
}

export default async function AnalysPage({ params }: Props) {
  const { sektor } = await params;
  const namn = SEKTOR_NAMN[sektor] ?? sektor;

  return (
    <main>
      <h1>Branschanalys: {namn}</h1>
      <p>Bristyrken och kompetensbehov i Jönköpings län.</p>
      <LanskartaD3 sektor={sektor} />
      <BristTabell sektor={sektor} />
    </main>
  );
}
