"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",            label: "Översikt" },
  { href: "/natverk",     label: "Nätverket" },
  { href: "/omstallning", label: "Omställning" },
  { href: "/roi",         label: "ROI" },
  { href: "/chatt",       label: "Chatt" },
  { href: "/kontakt",     label: "Kontakt" },
];

export default function NavBar() {
  const path = usePathname();
  return (
    <div className="bar">
      <Link href="/" className="mark">Crosstrees · Kompetensgrafen</Link>
      <nav className="nav" aria-label="Huvudnavigation">
        {LINKS.map(({ href, label }) => {
          const active = href === "/" ? (path === "/" || path.startsWith("/analys")) : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={active ? { color: "var(--rust)", borderBottomColor: "var(--rust)" } : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
