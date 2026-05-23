import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentFlow — Navigera på kompetens",
  description: "AI-drivet karriärstöd för svenska medborgare",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <header className="masthead">
          <Link href="/" className="wordmark" style={{ textDecoration: "none" }}>
            CROSSTREES · TALENTFLOW
          </Link>
          <span className="coord">57°24&prime;N · 15°04&prime;E — Vetlanda, Jönköpings län</span>
        </header>
        {children}
      </body>
    </html>
  );
}
