import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";

interface Props {
  searchParams: Promise<{ sektor?: string }>;
}

const SEKTORER = [
  { id: "industri", namn: "Tillverkning & industri" },
  { id: "vard", namn: "Vård & omsorg" },
  { id: "it", namn: "IT & digitalisering" },
  { id: "bygg", namn: "Bygg & anläggning" },
  { id: "logistik", namn: "Logistik & transport" },
  { id: "service", namn: "Service & handel" },
  { id: "utbildning", namn: "Utbildning" },
];

export default async function ExportPage({ searchParams }: Props) {
  const { sektor } = await searchParams;
  return (
    <main>
      <nav style={{ paddingTop: "0.5rem", marginBottom: "1rem" }}>
        <small className="data">
          <Link href="/">← TILLBAKA</Link>
        </small>
      </nav>
      <h1>Exportera rapport</h1>
      <p>
        Genererar en svensk PDF-rapport för mötesunderlag — bristyrken,
        antagandestabell och datakällor.
      </p>
      <form
        action={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/kompetensradet/export/pdf`}
        method="GET"
      >
        <label htmlFor="sektor">Sektor</label>
        <select id="sektor" name="sektor" required defaultValue={sektor ?? ""}>
          <option value="">— välj —</option>
          {SEKTORER.map((s) => (
            <option key={s.id} value={s.id}>
              {s.namn}
            </option>
          ))}
        </select>
        <br />
        <button type="submit" style={{ marginTop: "1.5rem" }}>
          Ladda ner PDF
        </button>
      </form>
      <AIActDisclaimer variant="graph" />
    </main>
  );
}
