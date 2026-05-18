import Link from "next/link";
import ROIKalkylator from "@/components/ROIKalkylator";

export const metadata = { title: "ROI-kalkyl — Kompetensrådet" };

export default function ROIPage() {
  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <span className="pill">Steg 4 av 5 · ROI-kalkyl</span>
            <h1 style={{ margin: "8px 0 4px" }}>
              ROI-kalkylator för utbildningsinsatser
            </h1>
            <p style={{ margin: 0, color: "var(--color-ink-soft)" }}>
              Beräkna förväntad avkastning på kompetensutvecklingsprogram med
              bootstrap-baserade konfidensintervall.
            </p>
          </div>
          <Link href="/export" className="btn-link secondary">
            Nästa: Exportera →
          </Link>
        </div>
      </section>
      <ROIKalkylator />
    </>
  );
}
