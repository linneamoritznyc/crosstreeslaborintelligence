import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface Props {
  searchParams: Promise<{ sektor?: string }>;
}

const SEKTORER = [
  { id: "industri", namn: "Industri" },
  { id: "vard", namn: "Vård och omsorg" },
  { id: "it", namn: "IT och digitalisering" },
  { id: "bygg", namn: "Bygg och anläggning" },
  { id: "logistik", namn: "Logistik och transport" },
  { id: "service", namn: "Service och handel" },
  { id: "utbildning", namn: "Utbildning" },
];

export default async function ExportPage({ searchParams }: Props) {
  const { sektor } = await searchParams;
  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
        <Link href="/">← Tillbaka</Link>
      </nav>
      <h1>Exportera rapport</h1>
      <p>
        Generera en svensk PDF-rapport för mötesunderlag. Rapporten innehåller
        bristyrken, antagandestabell och alla datakällor.
      </p>
      <form
        action={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/kompetensradet/export/pdf`}
        method="GET"
      >
        <label htmlFor="sektor" style={{ display: "block", margin: "1rem 0 0.25rem" }}>
          Välj sektor
        </label>
        <select id="sektor" name="sektor" required defaultValue={sektor ?? ""}>
          <option value="">— välj —</option>
          {SEKTORER.map((s) => (
            <option key={s.id} value={s.id}>
              {s.namn}
            </option>
          ))}
        </select>
        <br />
        <button type="submit" style={{ marginTop: "1rem" }}>
          Ladda ner PDF
        </button>
      </form>
      <AIActDisclaimer variant="graph" />
    </main>
  );
}
