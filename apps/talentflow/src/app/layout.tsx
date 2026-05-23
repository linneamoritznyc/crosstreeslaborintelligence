import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crosstrees — Navigera på kompetens, inte titlar",
  description: "AI-drivet infrastrukturlager för den svenska arbetsmarknaden",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const regionUrl =
    process.env.NEXT_PUBLIC_KOMPETENSGRAFEN_URL ??
    "https://kompetensgrafen.crosstrees.se";
  return (
    <html lang="sv">
      <body>
        <div className="bar">
          <Link href="/" className="mark">Crosstrees</Link>
          <nav className="nav">
            <Link href="/karriar">Karriär</Link>
            <Link href="/resultat">Analys</Link>
            <a href={regionUrl}>Regioner</a>
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
