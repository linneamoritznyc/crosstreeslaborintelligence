import type { NatverkKant } from "./natverk-typer";

/**
 * Kortaste omställningsvägen mellan två yrken.
 *
 * Kanterna är viktade på substituerbarhet (score 0–100). En stark koppling
 * ska vara "billig" att gå, så kostnaden är 100 - score: ett par med 75 %
 * överlapp kostar 25, ett par med 25 % kostar 75. Dijkstra ger då den väg
 * som sammanlagt kräver minst omlärning, inte den med färrast hopp.
 */
export function kortasteVag(
  kanter: NatverkKant[],
  fran: string,
  till: string
): { vag: string[]; kostnad: number } | null {
  if (!fran || !till || fran === till) return null;

  const grannar = new Map<string, { id: string; kostnad: number }[]>();
  for (const k of kanter) {
    const kostnad = Math.max(1, 100 - k.score);
    if (!grannar.has(k.kalla)) grannar.set(k.kalla, []);
    if (!grannar.has(k.mal)) grannar.set(k.mal, []);
    grannar.get(k.kalla)!.push({ id: k.mal, kostnad });
    grannar.get(k.mal)!.push({ id: k.kalla, kostnad });
  }

  if (!grannar.has(fran) || !grannar.has(till)) return null;

  const avstand = new Map<string, number>();
  const foregaende = new Map<string, string>();
  const kvar = new Set(grannar.keys());
  for (const id of kvar) avstand.set(id, Infinity);
  avstand.set(fran, 0);

  while (kvar.size > 0) {
    let nuvarande: string | null = null;
    let bast = Infinity;
    for (const id of kvar) {
      const d = avstand.get(id) ?? Infinity;
      if (d < bast) {
        bast = d;
        nuvarande = id;
      }
    }
    if (nuvarande === null || bast === Infinity) break;
    if (nuvarande === till) break;
    kvar.delete(nuvarande);

    for (const granne of grannar.get(nuvarande) ?? []) {
      if (!kvar.has(granne.id)) continue;
      const nyttAvstand = bast + granne.kostnad;
      if (nyttAvstand < (avstand.get(granne.id) ?? Infinity)) {
        avstand.set(granne.id, nyttAvstand);
        foregaende.set(granne.id, nuvarande);
      }
    }
  }

  if ((avstand.get(till) ?? Infinity) === Infinity) return null;

  const vag: string[] = [till];
  let steg = till;
  while (steg !== fran) {
    const forra = foregaende.get(steg);
    if (!forra) return null;
    vag.unshift(forra);
    steg = forra;
  }

  return { vag, kostnad: avstand.get(till) ?? 0 };
}

/** Alla kant-nycklar ("a|b", sorterade) som ingår i en väg. */
export function vagKanter(vag: string[]): Set<string> {
  const nycklar = new Set<string>();
  for (let i = 0; i < vag.length - 1; i++) {
    nycklar.add([vag[i], vag[i + 1]].sort().join("|"));
  }
  return nycklar;
}
