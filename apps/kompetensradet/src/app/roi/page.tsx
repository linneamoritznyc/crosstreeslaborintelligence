import Link from "next/link";
import ROIKalkylator from "@/components/ROIKalkylator";

export default function ROIPage() {
  return (
    <main className="page">
      <nav style={{ paddingTop: "0.5rem", marginBottom: "1rem" }}>
        <small className="data">
          <Link href="/">← TILLBAKA</Link>
        </small>
      </nav>
      <h1>ROI-kalkylator</h1>
      <p>
        Beräkna avkastning på utbildningsinsats med 95% konfidensintervall via
        bootstrap-resampling. Alla antaganden visas explicit.
      </p>
      <ROIKalkylator />
    </main>
  );
}
