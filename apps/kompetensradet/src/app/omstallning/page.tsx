import Link from "next/link";
import OmstallningsPanel from "@/components/OmstallningsPanel";

export const metadata = { title: "Omställningsstöd — Kompetensrådet" };

export default function OmstallningPage() {
  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <span className="pill">Steg 2 av 5 · Omställning</span>
            <h1 style={{ margin: "8px 0 4px" }}>Omställningsanalys</h1>
            <p style={{ margin: 0, color: "var(--color-ink-soft)" }}>
              Identifiera yrken med hög substituerbarhet och planera
              kompetensutvecklingsinsatser för Jönköpings län.
            </p>
          </div>
          <Link href="/roi" className="btn-link secondary">
            Nästa: ROI-kalkyl →
          </Link>
        </div>
      </section>
      <OmstallningsPanel />
    </>
  );
}
