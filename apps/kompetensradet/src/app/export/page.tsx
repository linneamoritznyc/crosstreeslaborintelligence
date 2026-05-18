import AIDisclaimer from "@/components/AIDisclaimer";
import SourceTag from "@/components/SourceTag";

export const metadata = { title: "Exportera rapport — Kompetensrådet" };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function ExportPage() {
  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <span className="pill">Steg 5 av 5 · Export</span>
            <h1 style={{ margin: "8px 0 4px" }}>Exportera mötesrapport</h1>
            <p style={{ margin: 0, color: "var(--color-ink-soft)" }}>
              Genererar en komplett rapport på svenska som PDF — alla fem
              analyssteg, datakällor, beräkningsmetod och AI Act-förbehåll.
              Klar för delning i möteschatten.
            </p>
          </div>
        </div>

        <form
          action={`${API_URL}/kompetensradet/export/pdf`}
          method="GET"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr auto",
            gap: "var(--space-md)",
            alignItems: "end",
          }}
        >
          <div>
            <label htmlFor="sektor">Välj sektor för rapporten</label>
            <select id="sektor" name="sektor" required defaultValue="industri">
              <option value="industri">Industri och tillverkning</option>
              <option value="vard">Vård och omsorg</option>
              <option value="it">IT och digitalisering</option>
              <option value="bygg">Bygg och anläggning</option>
            </select>
          </div>
          <button type="submit">Ladda ner PDF</button>
        </form>

        <p style={{ marginTop: "var(--space-md)", fontSize: "0.875rem", color: "var(--color-ink-muted)" }}>
          PDF:en innehåller branschanalys per kommun, bristyrken, omställningsanalys,
          ROI-kalkyl med 95% konfidensintervall, samt fullständig källförteckning.
        </p>

        <SourceTag source="reportlab · Crosstrees PDF-generator v1.0" />
        <AIDisclaimer variant="long" />
      </section>
    </>
  );
}
