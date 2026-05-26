import Link from "next/link";
import { getSession, ApiError, ApiUnavailable } from "@/lib/api";
import KompetensVerifiering from "@/components/KompetensVerifiering";

interface Props {
  params: Promise<{ session: string }>;
}

export default async function GranskaPage({ params }: Props) {
  const { session } = await params;

  let skills: string[] = [];
  let failure: { kind: "missing" | "unavailable"; detail?: string } | null = null;

  try {
    const data = await getSession(session);
    skills = data.skills;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      failure = { kind: "missing" };
    } else if (err instanceof ApiUnavailable) {
      failure = { kind: "unavailable" };
    } else {
      failure = {
        kind: "unavailable",
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (failure) {
    return (
      <main className="sheet">
        <header className="sheet-header">
          <p className="sheet-eyebrow">02 · Granskning</p>
          <h1 className="sheet-title">
            Session <span className="accent">saknas.</span>
          </h1>
          <p className="sheet-lede">
            {failure.kind === "missing"
              ? "Den här CV-sessionen finns inte i backendens minne. Antingen har 24-timmars-TTL gått ut, eller så har Railway-containern startats om sedan du laddade upp."
              : "Vi kan inte nå matching-API:n på Railway just nu. Inget av ditt CV är förlorat — vi visar bara fel data."}
          </p>
        </header>
        <div className="empty-options">
          <Link href="/">Ladda upp på nytt</Link>
          <Link href="https://status.railway.app">Kontrollera Railway-status</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="sheet">
      <header className="sheet-header">
        <p className="sheet-eyebrow">02 · Granskning</p>
        <h1 className="sheet-title">
          Stämmer detta <span className="accent">med dig?</span>
        </h1>
        <p className="sheet-lede">
          Innan vi söker jobb visar vi vad vår språkmodell läste från ditt
          CV. Du bestämmer vad som ska användas i matchningen — vi
          fabricerar inget om dig.
        </p>
      </header>

      <KompetensVerifiering sessionId={session} skills={skills} />

      <aside className="act-note">
        <strong>EU AI Act · artikel 14</strong>
        Människan har sista ordet (human oversight). Genom att tysta
        kompetenser eller lägga till gränser justerar du vad systemet får
        matcha mot. Du kan ångra dig på nästa sida.
      </aside>
    </main>
  );
}
