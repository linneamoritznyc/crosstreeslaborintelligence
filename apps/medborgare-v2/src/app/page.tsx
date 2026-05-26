import UppladdningInstrument from "@/components/UppladdningInstrument";

export default function StartPage() {
  return (
    <main className="sheet">
      <header className="sheet-header">
        <p className="sheet-eyebrow">Crosstrees · Medborgarverktyg · v2</p>
        <h1 className="sheet-title">
          Vad du <span className="accent">kan</span> — och var
          det <span className="accent">behövs.</span>
        </h1>
        <p className="sheet-lede">
          Ladda upp ditt CV. Vi läser ut dina kompetenser, jämför dem mot
          Arbetsförmedlingens yrkestaxonomi, och visar vilka jobb i
          Jönköpings län som faktiskt passar. Vi gissar inget. När vi
          inte vet, säger vi det.
        </p>
      </header>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Vad som händer när du laddar upp</span>
          <span className="step-num">5 steg</span>
        </h2>
        <p className="sheet-prose">
          Du väljer filen i din webbläsare. Texten skickas krypterat till
          oss. En AI läser texten och tar fram en lista över dina
          yrkeskompetenser. Du får se listan innan vi söker jobb — och du
          bestämmer själv vad som ska användas. Sessionen sparas i 24
          timmar och raderas sedan helt.
        </p>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Vad verktyget inte klarar</span>
          <span className="step-num">02 · ärlighet</span>
        </h2>
        <p className="sheet-prose">
          Skannade PDF:er — där texten är en bild — fungerar inte i den
          här versionen. Sökningen är låst till Jönköpings län. Varje
          matchning visas med ett konfidensintervall (95 %, Wilson). När
          intervallet är brett betyder det att vi har för få datapunkter
          för att vara säkra — och då säger vi det rakt ut.
        </p>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Börja här</span>
          <span className="step-num">påbörja</span>
        </h2>
        <UppladdningInstrument />
      </section>

      <aside className="act-note">
        <strong>EU AI Act · artikel 13</strong>
        Det här är ett AI-system med hög risk enligt EU 2024/1689.
        Resultaten är rekommendationer, inte beslut. Du fattar alltid
        själv det sista beslutet om din karriär. AI-anropen loggas i
        sex månader så att de går att granska i efterhand (artikel 12).
      </aside>
    </main>
  );
}
