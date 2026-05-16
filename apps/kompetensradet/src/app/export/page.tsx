export default function ExportPage() {
  return (
    <main>
      <h1>Exportera rapport</h1>
      <p>Generera PDF-rapport på svenska för Kompetensrådet.</p>
      <form action={`${process.env.NEXT_PUBLIC_API_URL}/kompetensradet/export/pdf`} method="GET">
        <label htmlFor="sektor">Välj sektor</label>
        <select id="sektor" name="sektor" required>
          <option value="">— välj —</option>
          <option value="industri">Industri</option>
          <option value="vard">Vård och omsorg</option>
          <option value="it">IT och digitalisering</option>
          <option value="bygg">Bygg och anläggning</option>
        </select>
        <button type="submit">Ladda ner PDF</button>
      </form>
    </main>
  );
}
