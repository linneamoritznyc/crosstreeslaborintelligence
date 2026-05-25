import Link from "next/link";
import ROIKalkylator from "@/components/ROIKalkylator";

export default function ROIPage() {
  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← ÖVERSIKT</Link>
          {" · ROI-KALKYLATOR"}
        </span>
      </div>
      <h1>ROI-kalkyl</h1>
      <p className="tagline" style={{ fontSize: "15px", marginBottom: "0.75rem" }}>
        Avkastning på utbildningsinsats — 95% konfidensintervall via bootstrap-resampling.
      </p>
      <p className="body-t">
        Alla antaganden visas explicit. Modellen beräknar förväntad löneutveckling
        och matchningssannolikhet baserat på AF:s efterfrågedata.
      </p>
      <div style={{ marginTop: "1.5rem" }}>
        <ROIKalkylator />
      </div>
    </main>
  );
}
