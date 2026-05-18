import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentFlow — Hitta ditt nästa steg",
  description:
    "AI-drivet karriärstöd för svenska medborgare. Ladda upp ditt CV för personliga jobbmatchningar, karriärvägar och kompetensgap baserat på Arbetsförmedlingens öppna data.",
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
