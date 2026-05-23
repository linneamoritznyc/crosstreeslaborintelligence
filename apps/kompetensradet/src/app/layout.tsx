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
        <header className="masthead">
          <Link href="/" className="wordmark" style={{ textDecoration: "none" }}>
            CROSSTREES · KOMPETENSRÅDET
          </Link>
          <span className="coord">57°24&prime;N · 15°04&prime;E — Jönköpings län</span>
        </header>
        {children}
      </body>
    </html>
  );
}
