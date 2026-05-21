import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentFlow — Hitta ditt nästa steg",
  description: "AI-drivet karriärstöd för svenska medborgare",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <header className="site-header">
          <a href="/" className="site-logo">TalentFlow</a>
          <nav>
            <a href="/">Hem</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
