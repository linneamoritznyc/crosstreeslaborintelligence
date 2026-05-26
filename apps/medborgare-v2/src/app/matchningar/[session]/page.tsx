import Link from "next/link";
import { getSession, ApiError, ApiUnavailable } from "@/lib/api";
import MatchningarLista from "@/components/MatchningarLista";

interface Props {
  params: Promise<{ session: string }>;
  searchParams: Promise<{ region?: string }>;
}

export default async function MatchningarPage({ params, searchParams }: Props) {
  const { session } = await params;
  const { region } = await searchParams;

  let skillCount = 0;
  let failure: "missing" | "unavailable" | null = null;

  try {
    const data = await getSession(session);
    skillCount = data.skill_count;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) failure = "missing";
    else if (err instanceof ApiUnavailable) failure = "unavailable";
    else failure = "unavailable";
  }

  if (failure) {
    return (
      <main className="sheet">
        <header className="sheet-header">
          <p className="sheet-eyebrow">03 · Matchningar</p>
          <h1 className="sheet-title">
            Sessionen <span className="accent">är borta.</span>
          </h1>
          <p className="sheet-lede">
            {failure === "missing"
              ? "De 24 timmar vi sparar din session har gått ut, eller så har vår server startats om sedan du laddade upp."
              : "Vi når inte servern just nu. Inget av det du sparat är förlorat — vi har bara inte tillgång till det i ögonblicket."}
          </p>
        </header>
        <div className="empty-options">
          <Link href="/">Ladda upp på nytt</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="sheet">
      <header className="sheet-header">
        <p className="sheet-eyebrow">03 · Matchningar</p>
        <h1 className="sheet-title">
          Vad som finns <span className="accent">just nu.</span>
        </h1>
        <p className="sheet-lede">
          Live från Arbetsförmedlingens Platsbanken. Annonserna rangordnas
          efter hur väl dina kompetenser överlappar med kravprofilen.
          Varje matchning visas med ett konfidensintervall — när det är
          brett betyder det att vi har för få datapunkter för att vara
          säkra.
        </p>
      </header>

      <div className="print-header" aria-hidden="true">
        Crosstrees Labor Intelligence · Matchningsrapport · {new Date().toLocaleDateString("sv-SE")}
      </div>

      <MatchningarLista sessionId={session} totalSkillCount={skillCount} initialRegion={region ?? "06"} />

      <aside className="act-note">
        <strong>EU AI Act · artikel 13 · transparens</strong>
        Poängen bygger på hur dina kompetenser överlappar med annonsens
        kravprofil. När en annons listar få krav blir intervallet brett
        — det är inte ett fel, det är vår ärliga redovisning av att vi
        inte har tillräckligt att räkna på.
      </aside>
    </main>
  );
}
