import Link from "next/link";
import { getSession, ApiError, ApiUnavailable } from "@/lib/api";
import KompetensVerifiering from "@/components/KompetensVerifiering";
import AiActLog from "@/components/AiActLog";

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
            Sessionen <span className="accent">är borta.</span>
          </h1>
          <p className="sheet-lede">
            {failure.kind === "missing"
              ? "Vi hittar inte din CV-session. Antingen har de 24 timmar vi sparar den gått ut, eller så har vår server startats om sedan du laddade upp."
              : "Vi når inte servern just nu. Inget av ditt CV är förlorat — vi har bara inte tillgång till det här ögonblicket."}
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
        <p className="sheet-eyebrow">02 · Granskning</p>
        <h1 className="sheet-title">
          Stämmer det <span className="accent">här med dig?</span>
        </h1>
        <p className="sheet-lede">
          Innan vi söker jobb vill vi visa vad AI:n läste från ditt CV.
          Det är du som bestämmer vad som ska användas i matchningen — vi
          hittar inte på något om dig.
        </p>
      </header>

      <KompetensVerifiering sessionId={session} skills={skills} />

      <aside className="act-note">
        <strong>EU AI Act · artikel 14</strong>
        Du har sista ordet. När du tystar en kompetens eller sätter en
        gräns ändras vad systemet får matcha mot. Du kan ångra dig på
        nästa sida.
      </aside>

      <AiActLog sessionId={session} />
    </main>
  );
}
