import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentFlow — Hitta ditt nästa steg",
  description:
    "AI-drivet karriärstöd för svenska medborgare. CV-uppladdning ger personliga jobbmatchningar, karriärvägar och kompetensgap.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
