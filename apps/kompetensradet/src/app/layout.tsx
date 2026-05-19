import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kompetensrådet — Jönköpings län",
  description: "Regional arbetsmarknadsanalys och kompetensstyrning",
};

const navLinks = [
  { href: "/", label: "Översikt" },
  { href: "/analys/industri", label: "Industri" },
  { href: "/analys/vård", label: "Vård och omsorg" },
  { href: "/analys/it", label: "IT och digitalisering" },
  { href: "/analys/bygg", label: "Bygg och anläggning" },
  { href: "/omstallning", label: "Omställningsstöd" },
  { href: "/roi", label: "ROI-kalkylator" },
  { href: "/chatt", label: "AI-rådgivare" },
  { href: "/export", label: "Exportera rapport" },
  { href: "/om", label: "Om systemet" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        {/* EU AI Act 2024/1689 Art. 14 — mänsklig tillsyn krävs vid beslut */}
        <div className="ai-act-disclaimer" role="note" aria-label="AI Act-upplysning">
          <strong>AI-stöd:</strong> Verifiera alltid rekommendationer mot källdata.
          Högriskssystem enligt EU AI Act 2024/1689, bilaga III punkt 4.
        </div>
        <div className="shell">
          <nav className="sidebar">
            <div className="sidebar-logo">
              Kompetensrådet<br />Jönköpings län
            </div>
            <div className="sidebar-title">Navigation</div>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
