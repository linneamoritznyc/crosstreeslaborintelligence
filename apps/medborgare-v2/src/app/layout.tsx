import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crosstrees · Medborgarverktyg v2",
  description:
    "Karriärnavigation via kompetens, byggd som ett precisionsinstrument.",
};

const TODAY = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <header className="legend-bar">
          <Link href="/" className="legend-mark">
            Crosstrees<span className="sub">· v2</span>
          </Link>
          <div className="legend-meta">
            <span>
              <span className="key">Källa</span>
              <span className="val">AF · ESCO</span>
            </span>
            <span>
              <span className="key">Region</span>
              <span className="val">06 · Jönköpings län</span>
            </span>
            <span>
              <span className="key">Utskrift</span>
              <span className="val">{TODAY}</span>
            </span>
          </div>
          <a
            href="https://talentflow.crosstrees.se"
            className="legend-link"
            title="Jämför mot version 1 (talentflow)"
          >
            v1 →
          </a>
        </header>
        {children}
        <footer className="foot-strip">
          <span className="l">Crosstrees Labor Intelligence · Vetlanda</span>
          <span className="m">CROSSTREES</span>
          <span className="r">v2 · ej upphandlad · ej beslutsfattande</span>
        </footer>
      </body>
    </html>
  );
}
