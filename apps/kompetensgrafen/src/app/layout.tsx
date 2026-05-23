import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kompetensgrafen — Jönköpings län",
  description: "Regional arbetsmarknadsanalys och kompetensstyrning",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <div className="bar">
          <Link href="/" className="mark">Crosstrees · Kompetensgrafen</Link>
          <nav className="nav">
            <Link href="/">Översikt</Link>
            <Link href="/omstallning">Omställning</Link>
            <Link href="/roi">ROI</Link>
            <Link href="/chatt">Chatt</Link>
          </nav>
        </div>
        {children}
        <footer className="foot">
          <span className="foot-t">Crosstrees Labor Intelligence · Vetlanda, Sverige</span>
          <span className="foot-mark">Crosstrees</span>
          <span className="foot-t">crosstrees.se · © 2026</span>
        </footer>
      </body>
    </html>
  );
}
