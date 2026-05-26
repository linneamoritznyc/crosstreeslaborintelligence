/**
 * Visualiserar en matchningspoäng som ett djupsondering — siffran är
 * inte ensam, den åtföljs alltid av sitt 95% Wilson-konfidensintervall.
 *
 * Filosofin: en poäng utan osäkerhetsmått är inte hederlig poäng. När
 * intervallet är brett (få datapunkter), ska användaren se det.
 */

import { depthClass } from "@/lib/api";

interface Props {
  score: number;
  ciLow: number;
  ciHigh: number;
}

export default function MatchKvalitet({ score, ciLow, ciHigh }: Props) {
  const cls = depthClass(score);
  const width = Math.max(2, Math.min(100, score));
  const ciRange = ciHigh - ciLow;
  const wide = ciRange > 25; // brett intervall = osäker poäng

  return (
    <div className="depth" aria-label={`Matchning ${score}%, KI ${ciLow}-${ciHigh}%`}>
      <span className={`depth-val ${cls}`}>{score}%</span>
      <span className="depth-ci">
        {ciLow}–{ciHigh}
        {wide && " · brett"}
      </span>
      <span className="depth-band">
        <span
          className={`depth-band-fill ${cls}`}
          style={{ width: `${width}%` }}
        />
      </span>
    </div>
  );
}
