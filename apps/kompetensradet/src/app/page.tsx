import Link from "next/link";

export default function StartPage() {
  return (
    <main>
      <h1>Kompetensrådet i Jönköpings län</h1>
      <p>Välkommen till regionens beslutsstöd för kompetensförsörjning.</p>
      <nav>
        <ul>
          <li><Link href="/analys/industri">Branschanalys</Link></li>
          <li><Link href="/omstallning">Omställningsstöd</Link></li>
          <li><Link href="/roi">ROI-kalkylator</Link></li>
          <li><Link href="/chatt">AI-rådgivare</Link></li>
          <li><Link href="/export">Exportera rapport</Link></li>
        </ul>
      </nav>
    </main>
  );
}
