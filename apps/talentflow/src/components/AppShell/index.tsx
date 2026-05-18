import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AppShell({ children }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/" className="brand" aria-label="TalentFlow startsida">
            <span className="brand-mark">TalentFlow</span>
            <span className="brand-sub">Karriärstöd från Crosstrees</span>
          </Link>
          <nav className="nav" aria-label="Huvudnavigation">
            <Link href="/">Ladda upp CV</Link>
            <Link href="/om">Om TalentFlow</Link>
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>
            Crosstrees Labor Intelligence · Vetlanda · AI-system klassat som
            högrisk enligt EU 2024/1689 Bilaga III punkt 4
          </span>
          <span>
            Data från Arbetsförmedlingen, SCB och ESCO ·{" "}
            <a href="mailto:kontakt@crosstrees.se">kontakt@crosstrees.se</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
