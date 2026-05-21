import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kompetensrådet — Jönköpings län",
  description: "Regional arbetsmarknadsanalys och kompetensstyrning",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <header className="site-header">
          <a href="/" className="site-logo">
            <span>Kompetensrådet</span>
            <small>Jönköpings län</small>
          </a>
          <nav>
            <a href="/analys/industri">Branschanalys</a>
            <a href="/omstallning">Omställning</a>
            <a href="/roi">ROI-kalkylator</a>
            <a href="/chatt">AI-rådgivare</a>
            <a href="/export">Exportera</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
