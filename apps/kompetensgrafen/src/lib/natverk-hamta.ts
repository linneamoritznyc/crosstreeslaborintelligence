import type { Natverk } from "./natverk-typer";
import { SEED_NATVERK } from "./natverk-seed";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface HamtResultat {
  natverk: Natverk;
  /** Sant när API:t inte gick att nå och den inbyggda seed-kopian används. */
  fallback: boolean;
  /** Felmeddelande att visa för användaren när fallback är sant. */
  fel: string | null;
}

/**
 * Hämtar nätverket från API:t. Faller tillbaka på den inbyggda seed-kopian
 * om API:t inte svarar, så att grafen aldrig renderas tom.
 *
 * Fallbacken är inte platshållardata — det är exakt samma datamängd som
 * API:t seedar in i Neo4j. Skillnaden är att live-annonsvolym saknas, vilket
 * meta.annonser_live signalerar och gränssnittet skriver ut.
 */
export async function hamtaNatverk(signal?: AbortSignal): Promise<HamtResultat> {
  if (!API_URL) {
    return {
      natverk: SEED_NATVERK,
      fallback: true,
      fel: "NEXT_PUBLIC_API_URL är inte satt i den här miljön.",
    };
  }

  try {
    const res = await fetch(`${API_URL}/kompetensgrafen/natverk`, {
      signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`API svarade ${res.status}`);
    }

    const data = (await res.json()) as Natverk;

    if (!data?.noder?.length) {
      throw new Error("API:t returnerade ett tomt nätverk");
    }

    return {
      natverk: {
        ...data,
        meta: { ...data.meta, kalla: "api", hamtad: new Date().toISOString() },
      },
      fallback: false,
      fel: null,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return {
      natverk: SEED_NATVERK,
      fallback: true,
      fel: err instanceof Error ? err.message : "Okänt fel vid hämtning",
    };
  }
}
