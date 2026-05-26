import Link from "next/link";
import { getSession, ApiError, ApiUnavailable } from "@/lib/api";
import MatchningarLista from "@/components/MatchningarLista";

interface Props {
  params: Promise<{ session: string }>;
}

export default async function MatchningarPage({ params }: Props) {
  const { session } = await params;

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
            Session <span className="accent">saknas.</span>
          </h1>
          <p className="sheet-lede">
            {failure === "missing"
              ? "Sessionen har gått ut (24 h-TTL) eller försvann i en backend-omstart."
              : "Vi når inte matching-API:n på Railway just nu. Inget sparat är förlorat — vi har bara inte tillgång till backenden."}
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
          Vad finns <span className="accent">just nu.</span>
        </h1>
        <p className="sheet-lede">
          Live från Arbetsförmedlingens Platsbanken. Rangordnat på
          kompetensöverlapp med 95 % Wilson-konfidensintervall. Brett
          intervall = osäker poäng.
        </p>
      </header>

      <MatchningarLista sessionId={session} totalSkillCount={skillCount} />

      <aside className="act-note">
        <strong>EU AI Act · artikel 13 · transparens</strong>
        Poängen baseras på överlapp mellan dina extraherade kompetenser
        och annonsens kravprofil. När en annons har få kompetenskrav blir
        konfidensintervallet brett — det är inte en defekt, det är en
        ärlig redovisning av att vi inte vet säkert.
      </aside>
    </main>
  );
}
