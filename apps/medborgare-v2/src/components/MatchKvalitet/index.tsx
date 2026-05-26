"use client";

import { useEffect, useState } from "react";
import { depthClass } from "@/lib/api";

interface Props {
  score: number;
  ciLow: number;
  ciHigh: number;
  /** If true and user hasn't seen explanation, show inline panel once */
  showExplanation?: boolean;
}

const CI_SEEN_KEY = "crosstrees:ci_explained";

export default function MatchKvalitet({ score, ciLow, ciHigh, showExplanation }: Props) {
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!showExplanation) return;
    try {
      if (!localStorage.getItem(CI_SEEN_KEY)) {
        setShowPanel(true);
        localStorage.setItem(CI_SEEN_KEY, "1");
      }
    } catch { /* ok */ }
  }, [showExplanation]);

  const cls = depthClass(score);
  const width = Math.max(2, Math.min(100, score));
  const ciRange = ciHigh - ciLow;
  const wide = ciRange > 25;

  return (
    <div>
      <div
        className="depth"
        aria-label={`Matchning ${score} procent. Konfidensintervall ${ciLow} till ${ciHigh} procent${wide ? ", brett intervall — osäker poäng" : ""}.`}
        title={
          wide
            ? `Konfidensintervallet är brett (${ciLow}–${ciHigh} %). Annonsen har för få utskrivna krav för att vi ska kunna vara säkra på poängen.`
            : `Konfidensintervall ${ciLow}–${ciHigh} % enligt Wilson-metoden.`
        }
      >
        <span className={`depth-val ${cls}`}>{score}%</span>
        <span className="depth-ci">
          {ciLow}–{ciHigh}
          {wide && " · osäker"}
        </span>
        <span className="depth-band">
          <span className={`depth-band-fill ${cls}`} style={{ width: `${width}%` }} />
        </span>
      </div>

      {showPanel && (
        <aside className="ci-explanation" role="note">
          <strong className="ci-explanation-head">Vad betyder intervallet?</strong>
          <p>
            Siffran är vår bästa uppskattning av hur väl du matchar — men
            vi är inte allvetande. Intervallet ({ciLow}–{ciHigh}%) visar
            osäkerheten: ju fler krav en annons listar, desto smalare
            intervall och desto säkrare poäng. En annons med tre krav ger
            ett bredare intervall än en med tolv.
          </p>
          <p>
            Tekniskt sett är det ett 95%-konfidensintervall enligt
            Wilson-metoden — samma metod som används i medicinsk statistik
            för att inte överskatta precision vid få datapunkter.
          </p>
          <button
            type="button"
            className="ci-explanation-close"
            onClick={() => setShowPanel(false)}
            aria-label="Stäng förklaring av konfidensintervall"
          >
            Förstått, stäng
          </button>
        </aside>
      )}
    </div>
  );
}
