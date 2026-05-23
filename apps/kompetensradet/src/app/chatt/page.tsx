import Link from "next/link";
import KompetensChatt from "@/components/KompetensChatt";
import AIActDisclaimer from "@/components/AIActDisclaimer";

export default function ChattPage() {
  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
        <Link href="/">← Tillbaka</Link>
      </nav>
      <h1>AI-rådgivare</h1>
      <p>
        Ställ fritextfrågor om arbetsmarknaden i Jönköpings län. AI:n svarar med
        kontextinjektion från Neo4j-grafen, AF Platsbanken och SCB-data.
      </p>
      <AIActDisclaimer variant="chat" />
      <KompetensChatt />
    </main>
  );
}
