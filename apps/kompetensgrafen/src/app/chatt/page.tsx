import Link from "next/link";
import KompetensChatt from "@/components/KompetensChatt";
import AIActDisclaimer from "@/components/AIActDisclaimer";

export default function ChattPage() {
  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← ÖVERSIKT</Link>
          {" · AI-RÅDGIVARE"}
        </span>
      </div>
      <h1>AI-rådgivare</h1>
      <p className="tagline" style={{ fontSize: "15px", marginBottom: "0.75rem" }}>
        Fritextfrågor om arbetsmarknaden i Jönköpings län.
      </p>
      <p className="body-t">
        Modellen svarar med kontextinjektion från Neo4j-grafen, AF Platsbanken och SCB-data.
      </p>
      <AIActDisclaimer variant="chat" />
      <div style={{ marginTop: "1.5rem" }}>
        <KompetensChatt />
      </div>
    </main>
  );
}
