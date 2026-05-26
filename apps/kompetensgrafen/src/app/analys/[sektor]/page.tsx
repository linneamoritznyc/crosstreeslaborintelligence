import { Suspense } from "react";
import type { Metadata } from "next";
import AIActDisclaimer from "@/components/AIActDisclaimer";
import SectorHero from "@/components/analys/SectorHero";
import StatsBand from "@/components/analys/StatsBand";
import Bristkarta from "@/components/analys/Bristkarta";
import BristyrkenTable from "@/components/analys/BristyrkenTable";
import OmstallningsCanvas from "@/components/analys/OmstallningsCanvas";
import ROIBlock from "@/components/analys/ROIBlock";
import ShareButton from "@/components/analys/ShareButton";
import PDFExportBlock from "@/components/analys/PDFExportBlock";
import { SEKTORER } from "@/lib/sektor-data";

interface Props {
  params: Promise<{ sektor: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sektor } = await params;
  const info = SEKTORER[sektor];
  if (!info) return {};
  const title = `${info.namn}: Bristkarta Jönköpings län`;
  const description =
    `Bristkarta, topp-10 bristyrken, karriärövergångar och ROI-kalkyl för ` +
    `${info.namn.toLowerCase()} i Jönköpings läns 13 kommuner. ` +
    `Live-data från AF Platsbanken och ESCO-taxonomin.`;
  return {
    title,
    description,
    openGraph: { title: `${info.namn} | Kompetensgrafen`, description },
    alternates: { canonical: `/analys/${sektor}` },
  };
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

      {/* Unique insight — first 90 seconds */}
      <div className="rope-divider" />
      <OmstallningsCanvas sektor={sektor} />

      <div className="rope-divider" />

      <Suspense fallback={
        <div className="analys-section">
          <div className="skeleton" style={{ height: 340, borderRadius: 0 }} />
        </div>
      }>
        <Bristkarta sektor={sektor} />
      </Suspense>

      <Suspense fallback={<div className="analys-section"><p className="coord">Laddar bristyrken…</p></div>}>
        <BristyrkenTable sektor={sektor} />
      </Suspense>

      <div className="rope-divider" />

      <ROIBlock sektor={sektor} />

      {/* PDF export — the payoff */}
      <PDFExportBlock sektor={sektor} sektorNamn={info.namn} />

      <div style={{ padding: "16px 40px", background: "var(--parchment-dark)",
        borderTop: "0.5px solid var(--border-faint)",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <AIActDisclaimer variant="graph" />
        <ShareButton />
      </div>
    </main>
  );
}
