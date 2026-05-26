import { Suspense } from "react";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import SectorHero from "@/components/analys/SectorHero";
import StatsBand from "@/components/analys/StatsBand";
import Bristkarta from "@/components/analys/Bristkarta";
import BristyrkenTable from "@/components/analys/BristyrkenTable";
import OmstallningsCanvas from "@/components/analys/OmstallningsCanvas";
import ROIBlock from "@/components/analys/ROIBlock";
import NastaSteg from "@/components/analys/NastaSteg";
import { SEKTORER } from "@/lib/sektor-data";

interface Props {
  params: Promise<{ sektor: string }>;
}

export default async function AnalysPage({ params }: Props) {
  const { sektor } = await params;
  const info = SEKTORER[sektor] ?? {
    namn: sektor,
    rustWord: sektor.toUpperCase(),
    h1Parts: [sektor.toUpperCase()],
    subhead: "Regional kompetensanalys för Jönköpings län.",
  };

  return (
    <main>
      <SectorHero sektor={sektor} info={info} />

      <Suspense fallback={<div style={{ height: 100, background: "rgba(237,231,216,0.5)" }} />}>
        <StatsBand sektor={sektor} />
      </Suspense>

      <Bristkarta sektor={sektor} />

      <Suspense fallback={<div className="analys-section"><p className="coord">Laddar bristyrken…</p></div>}>
        <BristyrkenTable sektor={sektor} />
      </Suspense>

      <div className="rope-divider" />

      <OmstallningsCanvas />

      <div className="rope-divider" />

      <ROIBlock sektor={sektor} />

      <NastaSteg sektor={sektor} />

      <div style={{ padding: "16px 40px", background: "var(--parchment-dark)",
        borderTop: "0.5px solid var(--border-faint)" }}>
        <AIActDisclaimer variant="graph" />
      </div>
    </main>
  );
}
