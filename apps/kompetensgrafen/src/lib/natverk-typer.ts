/**
 * Typer för kompetensnätverket (yrken som noder, kompetensöverlapp som kanter).
 *
 * Fält som kan vara `null` är fält där data saknas i den körande databasen.
 * De renderas som "okänt" i gränssnittet — aldrig som 0 eller ett gissat värde.
 */

export type SektorId =
  | "vard"
  | "industri"
  | "it"
  | "bygg"
  | "logistik"
  | "service"
  | "utbildning"
  | "ovrigt";

export interface NatverkNod {
  id: string;
  namn: string;
  ssyk: string;
  sektor: SektorId;
  definition: string;
  arbetsform: string;
  /** Aktiva platsannonser i Jönköpings län. null = kunde inte hämtas. */
  annonser?: number | null;
  /** Förändring i annonsvolym senaste 30 dagarna. null = ingen historik lagrad. */
  trend30?: number | null;
  /** Medianlön kr/mån. null = ingen lönedata per yrke i databasen. */
  medianlon?: number | null;
}

export interface KantRiktning {
  fran: string;
  till: string;
  /** "can_become" = källan kan bli målet. "can_replace" = källan kan ersätta målet. */
  typ: string;
}

export interface NatverkKant {
  kalla: string;
  mal: string;
  /** Substituerbarhet 0–100 enligt AF:s data. Seed använder 25 / 50 / 75. */
  score: number;
  riktningar: KantRiktning[];
  /** Delade kompetenser. Tom lista = REQUIRES-relationer saknas i databasen. */
  delade_kompetenser?: string[];
}

export interface NatverkMeta {
  /**
   * "af-taxonomi" = hela AF-taxonomins graf, statiskt byggd av CI.
   * "api" = live från Neo4j. "seed" = inbyggd kopia av seed-datan.
   */
  kalla: "af-taxonomi" | "api" | "seed";
  yrken: number;
  kompetenser: number;
  kanter_riktade: number;
  kanter_odirigerade: number;
  annonser_live: boolean;
  delade_kompetenser_tillgangliga: boolean;
  hamtad?: string;
}

export interface Natverk {
  noder: NatverkNod[];
  kanter: NatverkKant[];
  meta: NatverkMeta;
}

export interface SektorStil {
  namn: string;
  farg: string;
}

/**
 * Färg per sektor. Basen är designsystemets cyan (--rust) för de sektorer
 * som väger tyngst i länet; övriga fyller ut med toner som håller ihop mot
 * den mörka bakgrunden (#0D0F1A) och klarar kontrastkravet för text.
 */
export const SEKTOR_STIL: Record<SektorId, SektorStil> = {
  vard: { namn: "Vård & omsorg", farg: "#00CFFF" },
  industri: { namn: "Tillverkning & industri", farg: "#FF9F45" },
  it: { namn: "IT & digitalisering", farg: "#9D7BFF" },
  bygg: { namn: "Bygg & anläggning", farg: "#FFD75E" },
  logistik: { namn: "Logistik & transport", farg: "#3DDC97" },
  service: { namn: "Service & handel", farg: "#FF6B9D" },
  utbildning: { namn: "Utbildning", farg: "#5EC8FF" },
  ovrigt: { namn: "Övrigt", farg: "#7B80A0" },
};

export const RIKTNING_TEXT: Record<string, string> = {
  can_become: "kan bli",
  can_replace: "kan ersätta",
};
