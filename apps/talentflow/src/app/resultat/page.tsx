import Link from "next/link";
import ResultTabs from "@/components/ResultTabs";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export const metadata = { title: "Dina resultat — TalentFlow" };

export default async function ResultatPage({ searchParams }: Props) {
  const { session } = await searchParams;

  if (!session) {
    return (
      <section className="card">
        <h1>Inga resultat att visa</h1>
        <p>Ladda upp ett CV för att få personliga matchningar.</p>
        <Link href="/" className="btn-link">
          Tillbaka till start
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="card">
        <span className="pill">Resultat</span>
        <h1 style={{ margin: "12px 0 8px" }}>Här är vad vi hittade</h1>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Tre vinklar på ditt CV: vilka jobb du matchar nu, vilka karriärer
          som ligger nära, och vilka kompetenser som kan ta dig dit.
        </p>
      </section>
      <ResultTabs sessionId={session} />
    </>
  );
}
