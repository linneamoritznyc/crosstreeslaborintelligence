import Link from "next/link";
import AIActDisclaimer from "@/components/AIActDisclaimer";

const SEKTORER = [
  { id: "industri", namn: "Tillverkning & industri" },
  { id: "vard", namn: "Vård & omsorg" },
  { id: "it", namn: "IT & digitalisering" },
  { id: "bygg", namn: "Bygg & anläggning" },
  { id: "logistik", namn: "Logistik & transport" },
  { id: "service", namn: "Service & handel" },
  { id: "utbildning", namn: "Utbildning" },
];

interface Props {
  searchParams: Promise<{ sektor?: string }>;
}

export default async function ExportPage({ searchParams }: Props) {
  const { sektor } = await searchParams;
  return (
    <main className="page">
      <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow-line" />
        <span className="eyebrow-text">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← ÖVERSIKT</Link>
          {" · PDF-RAPPORT"}
        </span>
      </div>
      <h1>Exportera rapport</h1>
      <p className="tagline" style={{ fontSize: "15px", marginBottom: "0.75rem" }}>
        Beslutsunderlag på svenska: bristyrken, antagandestabell och datakällor.
      </p>
      <p className="body-t">
        Rapporten genereras direkt från live-data och kan delas med Kompetensrådet
        eller laddas upp i ärendesystemet.
      </p>
      <form
        action={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/kompetensgrafen/export/pdf`}
        method="GET"
        style={{ marginTop: "1.5rem" }}
      >
        <label htmlFor="sektor">Välj sektor</label>
        <select id="sektor" name="sektor" required defaultValue={sektor ?? ""}>
          <option value="">Välj sektor</option>
          {SEKTORER.map((s) => (
            <option key={s.id} value={s.id}>
              {s.namn}
            </option>
          ))}
        </select>
        <div style={{ marginTop: "1.5rem" }}>
          <button type="submit">Ladda ner PDF →</button>
        </div>
      </form>
      <AIActDisclaimer variant="graph" />
    </main>
  );
}
