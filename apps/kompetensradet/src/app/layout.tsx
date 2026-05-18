import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kompetensrådet — Jönköpings län",
  description:
    "Regionalt beslutsstöd för kompetensförsörjning. AI-drivet analys- och prognosverktyg byggt på SCB, AF Platsbanken och ESCO-data.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
