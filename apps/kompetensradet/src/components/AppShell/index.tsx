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
          <Link href="/" className="brand" aria-label="Kompetensrådet startsida">
            <span className="brand-mark">Kompetensrådet</span>
            <span className="brand-sub">Jönköpings län · Crosstrees</span>
          </Link>
          <nav className="nav" aria-label="Huvudnavigation">
            <Link href="/analys/industri">Branschanalys</Link>
            <Link href="/omstallning">Omställning</Link>
            <Link href="/roi">ROI-kalkyl</Link>
            <Link href="/chatt">AI-rådgivare</Link>
            <Link href="/export">Exportera</Link>
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>
            Crosstrees Labor Intelligence · Vetlanda · AI-system klassat som
            högrisk enligt EU 2024/1689 (Bilaga III punkt 4)
          </span>
          <span>Algoritmversion: pagerank_v1.0 · roi_bootstrap_v1.0</span>
        </div>
      </footer>
    </div>
  );
}
