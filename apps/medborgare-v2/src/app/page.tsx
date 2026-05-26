import UppladdningInstrument from "@/components/UppladdningInstrument";

export default function StartPage() {
  return (
    <main className="sheet">
      <header className="sheet-header">
        <p className="sheet-eyebrow">Crosstrees · Medborgarverktyg · v2</p>
        <h1 className="sheet-title">
          Sondering av <span className="accent">kompetensbotten.</span>
        </h1>
        <p className="sheet-lede">
          Ladda upp ditt CV. Vi extraherar dina kompetenser, jämför dem mot
          Arbetsförmedlingens taxonomi, och visar var i Jönköpings län de
          har djup. Inga matchningar fabriceras. Saknad data redovisas.
        </p>
      </header>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Vad som faktiskt händer när du laddar upp</span>
          <span className="step-num">5 steg</span>
        </h2>
        <p className="sheet-prose">
          Filen läses lokalt i din webbläsare. Texten skickas till vår
          backend på Railway. Anthropic Claude läser texten och returnerar
          en lista över yrkeskompetenser. Vi sparar dem mot ett session-id
          som lever i 24 timmar och raderas sedan permanent. Du får se
          listan innan vi söker jobb — du bestämmer vad som ska matchas.
        </p>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Verktygets gränser</span>
          <span className="step-num">02 · ärlighet</span>
        </h2>
        <p className="sheet-prose">
          Skannade PDF:er (där texten är bild) fungerar inte — vi har ingen
          OCR i den här versionen. Region är fast inställd på Jönköpings
          län. Matchningspoäng visas med 95 % Wilson-konfidensintervall —
          smal poäng från få datapunkter behandlas inte som säker poäng.
        </p>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Kalibrering</span>
          <span className="step-num">påbörja</span>
        </h2>
        <UppladdningInstrument />
      </section>

      <aside className="act-note">
        <strong>EU AI Act · artikel 13</strong>
        Det här är ett AI-system med hög risk enligt EU 2024/1689. Resultaten
        är rekommendationer, inte beslut. Du fattar alltid det slutliga
        beslutet om din karriär. AI-inferensanrop loggas i 6 månader för
        artikel 12-revision.
      </aside>
    </main>
  );
}
