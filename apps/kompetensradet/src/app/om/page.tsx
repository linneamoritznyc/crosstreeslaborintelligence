export const metadata = {
  title: "Om systemet — Kompetensrådet",
};

export default function OmPage() {
  return (
    <main>
      <h1>Om Crosstrees Labor Intelligence</h1>

      <div className="card">
        <h2>Syfte</h2>
        <p>
          Crosstrees Labor Intelligence är ett AI-drivet beslutsstöd för Kompetensrådet
          i Jönköpings län. Systemet sammanställer arbetsmarknadsdata från Arbetsförmedlingen,
          SCB och regionala källor för att stödja strategisk planering av kompetensutveckling.
        </p>
      </div>

      <div className="card">
        <h2>Regulatorisk status — EU AI Act</h2>
        <p>
          Systemet klassificeras som ett <strong>högriskssystem</strong> enligt EU:s
          AI-förordning (2024/1689), bilaga III punkt 4 (AI-system för sysselsättning,
          personalledning och tillgång till egenföretagande).
        </p>
        <p>Följande krav uppfylls:</p>
        <ul>
          <li>
            <strong>Art. 14 — Mänsklig tillsyn:</strong> Alla rekommendationer är
            underlag för mänskliga beslut. Inga automatiserade beslut fattas utan
            mänsklig bekräftelse.
          </li>
          <li>
            <strong>Art. 12 — Loggning:</strong> Alla AI-anrop loggas strukturerat
            (JSON via structlog) med tidsstämpel, modellversion och indata-hash.
            Loggar bevaras i 6 månader.
          </li>
          <li>
            <strong>Art. 50 — Transparens:</strong> Systemet identifierar sig som
            AI-genererat beslutsstöd på varje sida.
          </li>
        </ul>
        <p>
          <strong>Datakälla:</strong> SCB AM0208 (lediga platser och vakanser),
          Arbetsförmedlingens öppna API. CV-data sparas aldrig — inferens sker
          i minnet och loggas enbart som hash.
        </p>
      </div>

      <div className="card">
        <h2>Teknisk arkitektur</h2>
        <ul>
          <li>Frontend: Next.js 15 (App Router), hostat på Vercel</li>
          <li>Backend: FastAPI/Python 3.11, hostat på Railway</li>
          <li>AI-modell: Claude (claude-sonnet-4-6), Anthropic</li>
          <li>Matchningsalgoritm: Viktad TF-IDF med Wilson 95% konfidensintervall</li>
          <li>ROI-modell: Bootstrap-simulering (1 000 iterationer), baserad på SCB AM0110</li>
        </ul>
      </div>

      <div className="card">
        <h2>Begränsningar</h2>
        <p>
          Systemet visar tomma tillstånd när källdata saknas — inga fabricerade
          värden presenteras. ROI-beräkningar är modellbaserade uppskattningar,
          inte garanterade utfall. Bristindex baseras på tillgänglig AF/SCB-data
          och kan ha en eftersläpning på 1–4 veckor.
        </p>
      </div>
    </main>
  );
}
