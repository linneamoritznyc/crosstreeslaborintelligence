"use client";

import { useEffect, useState } from "react";

const NYCKEL = "kompetensgrafen.natverk.intro-stangd";

/**
 * Kort genomgång innan den fulla grafen. Extremt enkelt språk, inga fackord.
 * Valet att stänga sparas för sessionen, inte permanent.
 */
export default function Introduktion() {
  const [synlig, setSynlig] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(NYCKEL) !== "1") setSynlig(true);
    } catch {
      setSynlig(true);
    }
  }, []);

  if (!synlig) return null;

  const stang = () => {
    try {
      sessionStorage.setItem(NYCKEL, "1");
    } catch {
      /* privat läge — visa igen nästa gång, det gör inget */
    }
    setSynlig(false);
  };

  return (
    <section className="natverk-intro" aria-labelledby="natverk-intro-rubrik">
      <div className="natverk-intro-kort">
        <p className="rust-eyebrow" id="natverk-intro-rubrik">SÅ FUNKAR DET</p>
        <p className="natverk-intro-text">
          Varje prick är ett yrke. Två prickar som sitter nära varandra delar
          mycket kompetens. Det betyder att någon i det ena yrket ofta snabbt
          kan lära sig det andra. Klicka på en prick för att utforska.
        </p>
        <ul className="natverk-intro-lista">
          <li>
            <span className="natverk-intro-mark" /> Färgen visar vilken bransch
            yrket hör till.
          </li>
          <li>
            <span className="natverk-intro-mark" /> Tjocka streck = starkt
            överlapp mellan två yrken.
          </li>
          <li>
            <span className="natverk-intro-mark" /> Dra en prick åt sidan så
            stannar den kvar. Dubbelklicka för att släppa den fri.
          </li>
        </ul>
        <button className="natverk-knapp" onClick={stang}>
          Jag förstår, visa grafen
        </button>
      </div>
    </section>
  );
}
