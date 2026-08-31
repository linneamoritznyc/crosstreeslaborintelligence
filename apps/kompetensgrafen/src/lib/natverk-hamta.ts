import type { Natverk, NatverkKant, NatverkNod, SektorId } from "./natverk-typer";
import { SEED_NATVERK } from "./natverk-seed";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Kompakt format som byggs av services/data-pipeline/src/bygg_natverksdata.py. */
interface KompaktNod {
  id: string;
  namn: string;
  ssyk: string;
  sektor: string;
  def: string;
}
interface KompaktKant {
  a: string;
  b: string;
  score: number;
  r: { f: string; t: string; d: string }[];
}
interface KompaktFil {
  noder: KompaktNod[];
  kanter: KompaktKant[];
  meta: Record<string, unknown>;
}

export interface HamtResultat {
  natverk: Natverk;
  /** Sant när varken den fullständiga filen eller API:t gick att nå. */
  fallback: boolean;
  fel: string | null;
}

function franKompakt(fil: KompaktFil): Natverk {
  const noder: NatverkNod[] = fil.noder.map((n) => ({
    id: n.id,
    namn: n.namn,
    ssyk: n.ssyk,
    sektor: (n.sektor || "ovrigt") as SektorId,
    definition: n.def ?? "",
    arbetsform: "",
  }));

  const kanter: NatverkKant[] = fil.kanter.map((k) => ({
    kalla: k.a,
    mal: k.b,
    score: k.score,
    riktningar: k.r.map((r) => ({ fran: r.f, till: r.t, typ: r.d })),
    delade_kompetenser: [],
  }));

  const meta = fil.meta as Record<string, number | string>;
  return {
    noder,
    kanter,
    meta: {
      kalla: "af-taxonomi",
      yrken: noder.length,
      kompetenser: Number(meta.kompetenser ?? 0),
      kanter_riktade: Number(meta.kanter_riktade ?? 0),
      kanter_odirigerade: kanter.length,
      annonser_live: false,
      delade_kompetenser_tillgangliga: false,
      hamtad: typeof meta.hamtad === "string" ? meta.hamtad : undefined,
    },
  };
}

/**
 * Hämtar nätverket i tre steg, i fallande ordning av datamängd:
 *
 * 1. `/natverk-full.json` — hela AF-taxonomins substituerbarhetsgraf, byggd
 *    av GitHub Actions och serverad statiskt. Kräver ingen backend.
 * 2. API:t — samma graf ur Neo4j, plus live-annonsvolym när den finns.
 * 3. Den inbyggda seed-kopian, så grafen aldrig renderas tom.
 *
 * Fallbacken är inte platshållardata utan exakt den datamängd API:t seedar
 * in i Neo4j. Vilken källa som används skrivs ut i gränssnittet.
 */
export async function hamtaNatverk(signal?: AbortSignal): Promise<HamtResultat> {
  const problem: string[] = [];

  try {
    const res = await fetch("/natverk-full.json", { signal });
    if (res.ok) {
      const fil = (await res.json()) as KompaktFil;
      if (fil?.noder?.length && fil?.kanter?.length) {
        return { natverk: franKompakt(fil), fallback: false, fel: null };
      }
      problem.push("natverk-full.json var tom");
    } else if (res.status !== 404) {
      problem.push(`natverk-full.json svarade ${res.status}`);
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    problem.push(err instanceof Error ? err.message : "okänt fel");
  }

  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/kompetensgrafen/natverk`, {
        signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`API svarade ${res.status}`);
      const data = (await res.json()) as Natverk;
      if (!data?.noder?.length) throw new Error("API:t returnerade ett tomt nätverk");
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
      problem.push(err instanceof Error ? err.message : "okänt fel");
    }
  } else {
    problem.push("NEXT_PUBLIC_API_URL är inte satt");
  }

  return {
    natverk: SEED_NATVERK,
    fallback: true,
    fel: problem.join(" · ") || null,
  };
}
