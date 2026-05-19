import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
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
          <Link href="/" className="wordmark">Kompetensrådet · Jönköpings län</Link>
          <nav className="site-nav" aria-label="Huvudnavigation">
            <Link href="/analys/industri">Analys</Link>
            <Link href="/omstallning">Omställning</Link>
            <Link href="/roi">ROI</Link>
            <Link href="/chatt">AI-rådgivare</Link>
            <Link href="/export">Exportera</Link>
            <Link href="/om">Om systemet</Link>
          </nav>
        </header>

        {/* EU AI Act 2024/1689 Art. 14 — mänsklig tillsyn krävs vid beslut */}
        <div className="ai-act-disclaimer" role="note" aria-label="AI Act-upplysning">
          <strong>AI-stöd för beslut:</strong> Detta system är ett stöd för mänskligt
          beslutsfattande — inte ett automatiserat beslutssystem. Verifiera alltid
          rekommendationer mot aktuell källdata. Systemet klassificeras som
          högriskssystem enligt EU AI Act 2024/1689, bilaga III punkt 4.
        </div>

        <div className="site-content">
          {children}
        </div>

        <footer className="site-footer">
          Kompetensrådet i Jönköpings län · Crosstrees Labor Intelligence ·
          {" "}Loggning i enlighet med EU AI Act Art. 12 ·{" "}
          <Link href="/om">Om systemet</Link>
        </footer>
      </body>
    </html>
  );
}
