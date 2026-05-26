import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const DESCRIPTION =
  "Regional arbetsmarknadsanalys för Jönköpings läns 13 kommuner. " +
  "Bristkartor, omställningsanalys och ROI-kalkyl för Kompetensrådet Region Jönköping. " +
  "Live-data från AF Platsbanken, SCB och ESCO-taxonomin.";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kompetensgrafen — Jönköpings Kompetensråd",
    template: "%s | Kompetensgrafen",
  },
  description: DESCRIPTION,
  keywords: [
    "arbetsmarknad", "kompetensbrist", "Jönköping", "omställning",
    "ESCO", "kompetensförsörjning", "bristyrken", "yrkessubstitutabilitet",
    "Kompetensrådet", "Region Jönköping", "SCB", "Arbetsförmedlingen",
  ],
  authors: [{ name: "Crosstrees Labor Intelligence" }],
  creator: "Crosstrees Labor Intelligence",
  openGraph: {
    title: "Kompetensgrafen — Jönköpings Kompetensråd",
    description: DESCRIPTION,
    url: siteUrl,
    siteName: "Kompetensgrafen",
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kompetensgrafen — Regional arbetsmarknadsanalys",
    description: "Bristkartor, omställningsanalys och ROI för Jönköpings läns 13 kommuner.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
  alternates: { canonical: "/" },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Kompetensgrafen",
      description: DESCRIPTION,
      inLanguage: "sv-SE",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#org`,
      name: "Crosstrees Labor Intelligence",
      description: "AI-driven arbetsmarknadsintelligens för Sverige.",
      areaServed: { "@type": "AdministrativeArea", name: "Jönköpings län" },
    },
    {
      "@type": "Dataset",
      "@id": `${siteUrl}/#dataset`,
      name: "Kompetensgrafen — Regional arbetsmarknadsdata",
      description: "Bristindex, yrkesubstitutabilitet och sysselsättningsdata för Jönköpings läns 13 kommuner.",
      keywords: ["arbetsmarknad", "kompetensbrist", "ESCO", "Jönköping", "SCB", "Arbetsförmedlingen"],
      spatialCoverage: { "@type": "AdministrativeArea", name: "Jönköpings län", identifier: "SE-06" },
      temporalCoverage: "2024/2026",
      license: "https://creativecommons.org/licenses/by/4.0/",
      isAccessibleForFree: true,
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        <div className="bar">
          <Link href="/" className="mark">Crosstrees · Kompetensgrafen</Link>
          <nav className="nav" aria-label="Huvudnavigation">
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
