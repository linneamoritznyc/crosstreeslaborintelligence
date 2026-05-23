import Link from "next/link";
import KompetensChatt from "@/components/KompetensChatt";
import AIActDisclaimer from "@/components/AIActDisclaimer";

export default function ChattPage() {
  return (
    <main className="page">
      <nav style={{ paddingTop: "0.5rem", marginBottom: "1rem" }}>
        <small className="data">
          <Link href="/">← TILLBAKA</Link>
        </small>
      </nav>
      <h1>AI-rådgivare</h1>
      <p>
        Ställ fritextfrågor om arbetsmarknaden i Jönköpings län. Modellen svarar
        med kontextinjektion från Neo4j-grafen, AF Platsbanken och SCB-data.
      </p>
      <AIActDisclaimer variant="chat" />
      <KompetensChatt />
    </main>
  );
}
