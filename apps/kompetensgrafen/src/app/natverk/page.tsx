import type { Metadata } from "next";
import Kompetensnatverk from "@/components/Kompetensnatverk";
import Introduktion from "@/components/Kompetensnatverk/Introduktion";
import AIActDisclaimer from "@/components/AIActDisclaimer";

export const metadata: Metadata = {
  title: "Kompetensnätverket: yrken och deras överlapp",
  description:
    "Utforska hur yrken hänger ihop genom delad kompetens. Varje prick är ett " +
    "yrke, varje streck ett kompetensöverlapp. Sök, filtrera och hitta " +
    "kortaste omställningsvägen mellan två yrken i Jönköpings län.",
  alternates: { canonical: "/natverk" },
  openGraph: {
    title: "Kompetensnätverket | Kompetensgrafen",
    description:
      "Yrken som noder, kompetensöverlapp som kanter. Klicka runt och se vem " +
      "som kan bli vad.",
  },
};

export default function NatverkPage() {
  return (
    <main>
      <section className="natverk-hero">
        <p className="rust-eyebrow">KOMPETENSRÅDET REGION JÖNKÖPING</p>
        <h1 className="natverk-h1">
          KOMPETENS<span className="accent">NÄTVERKET</span>
        </h1>
        <p className="natverk-ingress">
          Arbetsmarknaden är inte en lista med yrken. Den är ett nätverk. Här ser
          du hur yrkena faktiskt hänger ihop — och vem som kan gå vart.
        </p>
      </section>

      <Introduktion />
      <Kompetensnatverk />

      <div className="natverk-fot">
        <AIActDisclaimer variant="graph" />
        <p className="coord">
          KÄLLA: NEO4J YRKESGRAF (AF SUBSTITUERBARHETSDATA) + AF PLATSBANKEN ·
          JÖNKÖPINGS LÄN
        </p>
      </div>
    </main>
  );
}
