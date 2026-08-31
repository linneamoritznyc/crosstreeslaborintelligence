"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReaktMusHandelse } from "react";
import * as d3 from "d3";
import {
  SEKTOR_STIL,
  RIKTNING_TEXT,
  type Natverk,
  type NatverkKant,
  type NatverkNod,
  type SektorId,
} from "@/lib/natverk-typer";
import { hamtaNatverk } from "@/lib/natverk-hamta";
import { kortasteVag, vagKanter } from "@/lib/natverk-vag";
import Minikarta from "./Minikarta";

interface SimNod extends d3.SimulationNodeDatum, NatverkNod {
  grad: number;
  radie: number;
  fastnalad: boolean;
}

interface SimKant extends d3.SimulationLinkDatum<SimNod> {
  nyckel: string;
  score: number;
  data: NatverkKant;
}

const BREDD_BRYT = 768;

function kantNyckel(a: string, b: string) {
  return [a, b].sort().join("|");
}

/** Nodradie: annonsvolym när den finns, annars antal kopplingar. Logaritmisk. */
function beraknaRadie(nod: NatverkNod, grad: number, annonserFinns: boolean): number {
  if (annonserFinns && typeof nod.annonser === "number") {
    return 5 + Math.log1p(nod.annonser) * 2.6;
  }
  return 5 + Math.log1p(grad) * 5.5;
}

export default function Kompetensnatverk() {
  const behallareRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<d3.Simulation<SimNod, SimKant> | null>(null);
  const noderRef = useRef<SimNod[]>([]);
  const kanterRef = useRef<SimKant[]>([]);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const pulsRef = useRef(0);
  const ramRef = useRef<number | null>(null);
  const storlekRef = useRef({ bredd: 900, hojd: 600 });

  const [natverk, setNatverk] = useState<Natverk | null>(null);
  const [laddar, setLaddar] = useState(true);
  const [fel, setFel] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const [forsok, setForsok] = useState(0);

  const [sokTerm, setSokTerm] = useState("");
  const [valdNodId, setValdNodId] = useState<string | null>(null);
  const [valdKant, setValdKant] = useState<NatverkKant | null>(null);
  const [troskel, setTroskel] = useState(0);
  const [franId, setFranId] = useState("");
  const [tillId, setTillId] = useState("");
  const [hoverNod, setHoverNod] = useState<SimNod | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [legendOppen, setLegendOppen] = useState(false);
  const [mobil, setMobil] = useState(false);
  const [dampadRorelse, setDampadRorelse] = useState(false);
  const [vyVersion, setVyVersion] = useState(0);

  // ---------------------------------------------------------------- inställningar

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const uppdatera = () => setDampadRorelse(media.matches);
    uppdatera();
    media.addEventListener("change", uppdatera);

    const bredd = window.matchMedia(`(max-width: ${BREDD_BRYT - 1}px)`);
    const uppdateraBredd = () => setMobil(bredd.matches);
    uppdateraBredd();
    bredd.addEventListener("change", uppdateraBredd);

    return () => {
      media.removeEventListener("change", uppdatera);
      bredd.removeEventListener("change", uppdateraBredd);
    };
  }, []);

  // ---------------------------------------------------------------- datahämtning

  useEffect(() => {
    const styrenhet = new AbortController();
    setLaddar(true);
    hamtaNatverk(styrenhet.signal)
      .then((resultat) => {
        setNatverk(resultat.natverk);
        setFallback(resultat.fallback);
        setFel(resultat.fel);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFel(err instanceof Error ? err.message : "Okänt fel");
      })
      .finally(() => setLaddar(false));
    return () => styrenhet.abort();
  }, [forsok]);

  const annonserFinns = natverk?.meta.annonser_live ?? false;

  const nodIndex = useMemo(() => {
    const karta = new Map<string, NatverkNod>();
    natverk?.noder.forEach((n) => karta.set(n.id, n));
    return karta;
  }, [natverk]);

  const sorteradeNoder = useMemo(
    () => [...(natverk?.noder ?? [])].sort((a, b) => a.namn.localeCompare(b.namn, "sv")),
    [natverk]
  );

  // ---------------------------------------------------------------- härledd vy

  const vagResultat = useMemo(() => {
    if (!natverk || !franId || !tillId) return null;
    return kortasteVag(natverk.kanter, franId, tillId);
  }, [natverk, franId, tillId]);

  const vagKantNycklar = useMemo(
    () => (vagResultat ? vagKanter(vagResultat.vag) : new Set<string>()),
    [vagResultat]
  );

  const synligaKanter = useMemo(
    () => (natverk?.kanter ?? []).filter((k) => k.score >= troskel),
    [natverk, troskel]
  );

  const synligaNodIds = useMemo(() => {
    const ids = new Set<string>();
    synligaKanter.forEach((k) => {
      ids.add(k.kalla);
      ids.add(k.mal);
    });
    return ids;
  }, [synligaKanter]);

  const grannarTillVald = useMemo(() => {
    if (!valdNodId) return new Set<string>();
    const ids = new Set<string>();
    synligaKanter.forEach((k) => {
      if (k.kalla === valdNodId) ids.add(k.mal);
      if (k.mal === valdNodId) ids.add(k.kalla);
    });
    return ids;
  }, [valdNodId, synligaKanter]);

  const sokTraffar = useMemo(() => {
    const term = sokTerm.trim().toLowerCase();
    if (!term) return [];
    return sorteradeNoder.filter((n) => n.namn.toLowerCase().includes(term)).slice(0, 6);
  }, [sokTerm, sorteradeNoder]);

  // ---------------------------------------------------------------- simulering

  useEffect(() => {
    if (!natverk || !canvasRef.current || !behallareRef.current) return;

    const grad = new Map<string, number>();
    natverk.kanter.forEach((k) => {
      grad.set(k.kalla, (grad.get(k.kalla) ?? 0) + 1);
      grad.set(k.mal, (grad.get(k.mal) ?? 0) + 1);
    });

    const noder: SimNod[] = natverk.noder.map((n) => {
      const g = grad.get(n.id) ?? 0;
      return { ...n, grad: g, radie: beraknaRadie(n, g, annonserFinns), fastnalad: false };
    });
    const nodKarta = new Map(noder.map((n) => [n.id, n]));

    const kanter: SimKant[] = natverk.kanter
      .filter((k) => nodKarta.has(k.kalla) && nodKarta.has(k.mal))
      .map((k) => ({
        source: nodKarta.get(k.kalla)!,
        target: nodKarta.get(k.mal)!,
        nyckel: kantNyckel(k.kalla, k.mal),
        score: k.score,
        data: k,
      }));

    noderRef.current = noder;
    kanterRef.current = kanter;

    const { bredd, hojd } = storlekRef.current;

    const sim = d3
      .forceSimulation<SimNod>(noder)
      .force(
        "link",
        d3
          .forceLink<SimNod, SimKant>(kanter)
          .id((d) => d.id)
          // Starkt överlapp drar yrkena närmare varandra.
          .distance((d) => 190 - d.score * 1.1)
          .strength(0.7)
      )
      .force("charge", d3.forceManyBody<SimNod>().strength(-420))
      .force("center", d3.forceCenter(bredd / 2, hojd / 2))
      .force(
        "collide",
        d3.forceCollide<SimNod>().radius((d) => d.radie + 26)
      )
      .force("x", d3.forceX(bredd / 2).strength(0.04))
      .force("y", d3.forceY(hojd / 2).strength(0.06));

    simRef.current = sim;

    if (dampadRorelse) {
      // Hoppa direkt till slutläget i stället för att animera fram det.
      sim.stop();
      for (let i = 0; i < 320; i++) sim.tick();
      setVyVersion((v) => v + 1);
    } else {
      sim.alpha(1).restart();
    }

    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [natverk, annonserFinns, dampadRorelse]);

  // ---------------------------------------------------------------- rendering

  const rita = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { bredd, hojd } = storlekRef.current;
    const dpr = window.devicePixelRatio || 1;
    const transform = transformRef.current;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, bredd, hojd);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    const puls = dampadRorelse ? 0 : (Math.sin(pulsRef.current / 26) + 1) / 2;

    // --- kanter
    for (const kant of kanterRef.current) {
      if (kant.score < troskel) continue;
      const kalla = kant.source as SimNod;
      const mal = kant.target as SimNod;
      if (kalla.x == null || mal.x == null) continue;

      const iVag = vagKantNycklar.has(kant.nyckel);
      const rorVald =
        valdNodId != null && (kalla.id === valdNodId || mal.id === valdNodId);
      const dampad = valdNodId != null && !rorVald;

      ctx.beginPath();
      ctx.moveTo(kalla.x, kalla.y!);
      ctx.lineTo(mal.x, mal.y!);
      // Tjocklek speglar överlappets styrka.
      ctx.lineWidth = 0.6 + (kant.score / 100) * 3.4;

      if (iVag) {
        ctx.strokeStyle = "#00CFFF";
        ctx.lineWidth += 1.6;
        ctx.shadowColor = "rgba(0,207,255,0.85)";
        ctx.shadowBlur = 14;
        if (!dampadRorelse) {
          ctx.setLineDash([10, 8]);
          ctx.lineDashOffset = -pulsRef.current * 0.6;
        }
      } else if (rorVald) {
        ctx.strokeStyle = "rgba(0,207,255,0.55)";
      } else {
        ctx.strokeStyle = dampad
          ? "rgba(221,226,242,0.05)"
          : `rgba(221,226,242,${0.08 + (kant.score / 100) * 0.16})`;
      }

      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

    // --- noder
    for (const nod of noderRef.current) {
      if (nod.x == null || nod.y == null) continue;
      if (troskel > 0 && !synligaNodIds.has(nod.id)) continue;

      const stil = SEKTOR_STIL[nod.sektor as SektorId] ?? SEKTOR_STIL.ovrigt;
      const arVald = nod.id === valdNodId;
      const arGranne = grannarTillVald.has(nod.id);
      const iVag = vagResultat?.vag.includes(nod.id) ?? false;
      const dampad = valdNodId != null && !arVald && !arGranne;

      // Yrken med stigande annonsvolym pulserar. Utan trenddata: ingen puls.
      const stigande = typeof nod.trend30 === "number" && nod.trend30 > 0;
      const radie = nod.radie * (stigande ? 1 + puls * 0.05 : 1);

      if (arVald || iVag) {
        ctx.beginPath();
        ctx.arc(nod.x, nod.y, radie + 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,207,255,0.16)";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(nod.x, nod.y, radie, 0, Math.PI * 2);
      ctx.globalAlpha = dampad ? 0.28 : 1;
      ctx.fillStyle = stil.farg;
      ctx.fill();

      if (nod.fastnalad) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#DDE2F2";
        ctx.stroke();
      }

      // Etikett: alltid för valda/vägnoder, annars för de mest kopplade.
      const visaEtikett = arVald || arGranne || iVag || nod.grad >= 3 || transform.k > 1.4;
      if (visaEtikett) {
        ctx.globalAlpha = dampad ? 0.32 : 1;
        ctx.font = `700 ${11 / Math.max(transform.k, 0.8)}px 'Courier Prime', monospace`;
        ctx.fillStyle = arVald || iVag ? "#00CFFF" : "rgba(221,226,242,0.82)";
        ctx.textAlign = "center";
        ctx.fillText(nod.namn, nod.x, nod.y - radie - 7);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [
    troskel,
    valdNodId,
    grannarTillVald,
    synligaNodIds,
    vagKantNycklar,
    vagResultat,
    dampadRorelse,
  ]);

  // Rita om vid varje simuleringstick och vid vy-ändringar.
  useEffect(() => {
    let aktiv = true;
    const loop = () => {
      if (!aktiv) return;
      if (!dampadRorelse) pulsRef.current += 1;
      rita();
      ramRef.current = requestAnimationFrame(loop);
    };
    ramRef.current = requestAnimationFrame(loop);
    return () => {
      aktiv = false;
      if (ramRef.current != null) cancelAnimationFrame(ramRef.current);
    };
  }, [rita, dampadRorelse, vyVersion]);

  // ---------------------------------------------------------------- storlek

  useEffect(() => {
    const behallare = behallareRef.current;
    const canvas = canvasRef.current;
    if (!behallare || !canvas) return;

    const anpassa = () => {
      const bredd = behallare.clientWidth;
      const hojd = mobil ? 460 : 620;
      storlekRef.current = { bredd, hojd };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = bredd * dpr;
      canvas.height = hojd * dpr;
      canvas.style.width = `${bredd}px`;
      canvas.style.height = `${hojd}px`;

      const sim = simRef.current;
      if (sim) {
        sim.force("center", d3.forceCenter(bredd / 2, hojd / 2));
        sim.force("x", d3.forceX(bredd / 2).strength(0.04));
        sim.force("y", d3.forceY(hojd / 2).strength(0.06));
        if (!dampadRorelse) sim.alpha(0.3).restart();
      }
      rita();
    };

    anpassa();
    const observer = new ResizeObserver(anpassa);
    observer.observe(behallare);
    return () => observer.disconnect();
  }, [mobil, rita, dampadRorelse, natverk]);

  // ---------------------------------------------------------------- zoom & drag

  const nodVidPunkt = useCallback((klientX: number, klientY: number): SimNod | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const transform = transformRef.current;
    const x = transform.invertX(klientX - rect.left);
    const y = transform.invertY(klientY - rect.top);

    for (let i = noderRef.current.length - 1; i >= 0; i--) {
      const nod = noderRef.current[i];
      if (nod.x == null || nod.y == null) continue;
      if (troskel > 0 && !synligaNodIds.has(nod.id)) continue;
      const dx = x - nod.x;
      const dy = y - nod.y;
      if (dx * dx + dy * dy < (nod.radie + 6) ** 2) return nod;
    }
    return null;
  }, [troskel, synligaNodIds]);

  const kantVidPunkt = useCallback((klientX: number, klientY: number): SimKant | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const transform = transformRef.current;
    const x = transform.invertX(klientX - rect.left);
    const y = transform.invertY(klientY - rect.top);

    let bast: SimKant | null = null;
    let bastAvstand = 8;

    for (const kant of kanterRef.current) {
      if (kant.score < troskel) continue;
      const a = kant.source as SimNod;
      const b = kant.target as SimNod;
      if (a.x == null || b.x == null) continue;
      const dx = b.x - a.x;
      const dy = b.y! - a.y!;
      const langd2 = dx * dx + dy * dy;
      if (langd2 === 0) continue;
      let t = ((x - a.x) * dx + (y - a.y!) * dy) / langd2;
      t = Math.max(0, Math.min(1, t));
      const px = a.x + t * dx;
      const py = a.y! + t * dy;
      const avstand = Math.hypot(x - px, y - py);
      if (avstand < bastAvstand) {
        bastAvstand = avstand;
        bast = kant;
      }
    }
    return bast;
  }, [troskel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const urval = d3.select<HTMLCanvasElement, unknown>(canvas);

    const zoomBeteende = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.35, 4])
      .on("zoom", (handelse) => {
        transformRef.current = handelse.transform;
        rita();
      });
    zoomRef.current = zoomBeteende;

    let dragNod: SimNod | null = null;

    const dragBeteende = d3
      .drag<HTMLCanvasElement, unknown, SimNod | null>()
      .subject((handelse) => {
        const kalla = handelse.sourceEvent as MouseEvent;
        return nodVidPunkt(kalla.clientX, kalla.clientY);
      })
      .on("start", (handelse) => {
        dragNod = handelse.subject;
        if (!dragNod) return;
        if (!dampadRorelse) simRef.current?.alphaTarget(0.25).restart();
      })
      .on("drag", (handelse) => {
        if (!dragNod) return;
        const rect = canvas.getBoundingClientRect();
        const transform = transformRef.current;
        dragNod.fx = transform.invertX(handelse.sourceEvent.clientX - rect.left);
        dragNod.fy = transform.invertY(handelse.sourceEvent.clientY - rect.top);
        if (dampadRorelse) {
          dragNod.x = dragNod.fx;
          dragNod.y = dragNod.fy;
          rita();
        }
      })
      .on("end", () => {
        if (!dragNod) return;
        // Noden stannar där användaren släppte den — dubbelklick frigör.
        dragNod.fastnalad = true;
        simRef.current?.alphaTarget(0);
        dragNod = null;
        rita();
      });

    urval.call(zoomBeteende).call(dragBeteende);
    urval.on("dblclick.zoom", null);

    return () => {
      urval.on(".zoom", null);
      urval.on(".drag", null);
    };
  }, [nodVidPunkt, rita, dampadRorelse]);

  // ---------------------------------------------------------------- pekhändelser

  const vidPekarRorelse = useCallback(
    (h: ReaktMusHandelse<HTMLCanvasElement>) => {
      if (mobil) return;
      const nod = nodVidPunkt(h.clientX, h.clientY);
      setHoverNod(nod);
      if (nod) {
        const rect = h.currentTarget.getBoundingClientRect();
        setHoverPos({ x: h.clientX - rect.left, y: h.clientY - rect.top });
      }
    },
    [mobil, nodVidPunkt]
  );

  const vidKlick = useCallback(
    (h: ReaktMusHandelse<HTMLCanvasElement>) => {
      const nod = nodVidPunkt(h.clientX, h.clientY);
      if (nod) {
        setValdNodId((tidigare) => (tidigare === nod.id ? null : nod.id));
        setValdKant(null);
        if (mobil) {
          const rect = h.currentTarget.getBoundingClientRect();
          setHoverNod(nod);
          setHoverPos({ x: h.clientX - rect.left, y: h.clientY - rect.top });
        }
        return;
      }
      const kant = kantVidPunkt(h.clientX, h.clientY);
      if (kant) {
        setValdKant(kant.data);
        setValdNodId(null);
        return;
      }
      setValdNodId(null);
      setValdKant(null);
      setHoverNod(null);
    },
    [nodVidPunkt, kantVidPunkt, mobil]
  );

  const vidDubbelklick = useCallback(
    (h: ReaktMusHandelse<HTMLCanvasElement>) => {
      const nod = nodVidPunkt(h.clientX, h.clientY);
      if (!nod) return;
      nod.fx = null;
      nod.fy = null;
      nod.fastnalad = false;
      if (!dampadRorelse) simRef.current?.alpha(0.3).restart();
      rita();
    },
    [nodVidPunkt, rita, dampadRorelse]
  );

  // ---------------------------------------------------------------- centrera

  const centreraPa = useCallback(
    (nodId: string) => {
      const canvas = canvasRef.current;
      const zoomBeteende = zoomRef.current;
      const nod = noderRef.current.find((n) => n.id === nodId);
      if (!canvas || !zoomBeteende || !nod || nod.x == null || nod.y == null) return;

      const { bredd, hojd } = storlekRef.current;
      const skala = 1.7;
      const mal = d3.zoomIdentity
        .translate(bredd / 2 - nod.x * skala, hojd / 2 - nod.y * skala)
        .scale(skala);

      const urval = d3.select<HTMLCanvasElement, unknown>(canvas);
      if (dampadRorelse) {
        urval.call(zoomBeteende.transform, mal);
      } else {
        urval
          .transition()
          .duration(600)
          .ease(d3.easeCubicOut)
          .call(zoomBeteende.transform, mal);
      }
      setValdNodId(nodId);
      setValdKant(null);
    },
    [dampadRorelse]
  );

  const nollstallVy = useCallback(() => {
    const canvas = canvasRef.current;
    const zoomBeteende = zoomRef.current;
    if (!canvas || !zoomBeteende) return;
    d3.select<HTMLCanvasElement, unknown>(canvas).call(
      zoomBeteende.transform,
      d3.zoomIdentity
    );
    setValdNodId(null);
    setValdKant(null);
  }, []);

  // ---------------------------------------------------------------- tillstånd

  if (laddar) {
    return (
      <div className="natverk-skal" aria-busy="true">
        <p className="coord">Laddar kompetensnätverket…</p>
      </div>
    );
  }

  if (!natverk) {
    return (
      <div className="natverk-skal natverk-fel" role="alert">
        <p className="rust-eyebrow">NÄTVERKET KUNDE INTE LADDAS</p>
        <p className="body-t">{fel ?? "Okänt fel."}</p>
        <button className="natverk-knapp" onClick={() => setForsok((f) => f + 1)}>
          Försök igen
        </button>
      </div>
    );
  }

  const antalSynligaNoder =
    troskel > 0 ? synligaNodIds.size : natverk.noder.length;
  const valdNod = valdNodId ? nodIndex.get(valdNodId) : null;
  const sektorerIBruk = Array.from(
    new Set(natverk.noder.map((n) => n.sektor))
  ) as SektorId[];

  return (
    <div className="natverk-rot">
      {/* ---------------------------------------------------- aha-raden */}
      <div className="natverk-aha">
        <p className="natverk-aha-text">
          <strong>{natverk.meta.yrken}</strong> yrken.{" "}
          <strong>{natverk.meta.kanter_odirigerade}</strong> kopplingar mellan dem.
          Klicka på ett för att se vad du kan bli härnäst.
        </p>
        <p className="coord natverk-aha-kalla">
          {natverk.meta.kalla === "api"
            ? `LIVE FRÅN NEO4J · ${natverk.meta.kanter_riktade} RIKTADE KANTER · ${natverk.meta.kompetenser} KOMPETENSER`
            : `INBYGGD SEED-KOPIA · ${natverk.meta.kanter_riktade} RIKTADE KANTER · ${natverk.meta.kompetenser} KOMPETENSER`}
        </p>
      </div>

      {/* ---------------------------------------------------- datavarning */}
      {fallback && (
        <div className="natverk-notis" role="status">
          <strong>Visar inbyggd seed-data.</strong> API:t svarade inte
          {fel ? ` (${fel})` : ""}. Siffrorna ovan är den faktiska seed-datamängden
          som laddas in i Neo4j, inte live-data och inte uppskattningar.
          <button
            className="natverk-knapp natverk-knapp-liten"
            onClick={() => setForsok((f) => f + 1)}
          >
            Försök hämta live igen
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- kontroller */}
      <div className="natverk-kontroller">
        <div className="natverk-falt">
          <label className="rust-eyebrow" htmlFor="natverk-sok">
            SÖK ETT YRKE
          </label>
          <input
            id="natverk-sok"
            type="search"
            className="natverk-input"
            placeholder="Sök ett yrke…"
            value={sokTerm}
            onChange={(h) => setSokTerm(h.target.value)}
            onKeyDown={(h) => {
              if (h.key === "Enter" && sokTraffar[0]) {
                centreraPa(sokTraffar[0].id);
                setSokTerm(sokTraffar[0].namn);
              }
            }}
            aria-describedby="natverk-sok-hjalp"
          />
          <span id="natverk-sok-hjalp" className="natverk-hjalp">
            Enter centrerar grafen på första träffen.
          </span>
          {sokTraffar.length > 0 && (
            <ul className="natverk-traffar" role="listbox" aria-label="Sökträffar">
              {sokTraffar.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      centreraPa(n.id);
                      setSokTerm(n.namn);
                    }}
                  >
                    {n.namn}
                    <span className="natverk-traff-sektor">
                      {SEKTOR_STIL[n.sektor as SektorId]?.namn ?? "Övrigt"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="natverk-falt">
          <label className="rust-eyebrow" htmlFor="natverk-troskel">
            VISA KOPPLINGAR FRÅN {troskel}% ÖVERLAPP
          </label>
          <input
            id="natverk-troskel"
            type="range"
            className="natverk-slider"
            min={0}
            max={75}
            step={5}
            value={troskel}
            onChange={(h) => setTroskel(Number(h.target.value))}
          />
          <span className="natverk-hjalp">
            Dra åt höger för att bara se de starkaste kopplingarna.
          </span>
        </div>

        <div className="natverk-falt">
          <span className="rust-eyebrow">HITTA VÄG MELLAN TVÅ YRKEN</span>
          <div className="natverk-vagval">
            <select
              className="natverk-input"
              value={franId}
              onChange={(h) => setFranId(h.target.value)}
              aria-label="Från yrke"
            >
              <option value="">Från…</option>
              {sorteradeNoder.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.namn}
                </option>
              ))}
            </select>
            <select
              className="natverk-input"
              value={tillId}
              onChange={(h) => setTillId(h.target.value)}
              aria-label="Till yrke"
            >
              <option value="">Till…</option>
              {sorteradeNoder.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.namn}
                </option>
              ))}
            </select>
          </div>
          {franId && tillId && !vagResultat && (
            <span className="natverk-hjalp natverk-varning">
              Ingen väg finns mellan de yrkena i nuvarande data.
            </span>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- räkneverk */}
      <div className="natverk-rakneverk">
        <span>
          Visar <strong>{antalSynligaNoder}</strong> av{" "}
          <strong>{natverk.noder.length}</strong> yrken,{" "}
          <strong>{synligaKanter.length}</strong> kopplingar
        </span>
        <button className="natverk-knapp natverk-knapp-liten" onClick={nollstallVy}>
          Återställ vy
        </button>
      </div>

      {/* ---------------------------------------------------- graf */}
      <div className="natverk-scen" ref={behallareRef}>
        <div className="natverk-blobbar" aria-hidden="true">
          <span className="blobb blobb-1" />
          <span className="blobb blobb-2" />
          <span className="blobb blobb-3" />
        </div>

        <canvas
          ref={canvasRef}
          className="natverk-canvas"
          role="img"
          aria-label={`Kompetensnätverk med ${natverk.noder.length} yrken och ${natverk.meta.kanter_odirigerade} kopplingar. Använd sökfältet ovan för att navigera utan mus.`}
          onMouseMove={vidPekarRorelse}
          onMouseLeave={() => setHoverNod(null)}
          onClick={vidKlick}
          onDoubleClick={vidDubbelklick}
        />

        {hoverNod && (
          <div
            className="natverk-tooltip"
            style={{
              left: Math.min(hoverPos.x + 16, storlekRef.current.bredd - 240),
              top: Math.min(hoverPos.y + 16, storlekRef.current.hojd - 130),
            }}
          >
            <p className="natverk-tooltip-namn">{hoverNod.namn}</p>
            <p className="natverk-tooltip-rad">
              {SEKTOR_STIL[hoverNod.sektor as SektorId]?.namn ?? "Övrigt"} · SSYK{" "}
              {hoverNod.ssyk}
            </p>
            <p className="natverk-tooltip-rad">
              Lediga jobb:{" "}
              <strong>
                {typeof hoverNod.annonser === "number"
                  ? hoverNod.annonser
                  : "okänt"}
              </strong>
            </p>
            <p className="natverk-tooltip-rad">
              Snittlön:{" "}
              <strong>
                {typeof hoverNod.medianlon === "number"
                  ? `${hoverNod.medianlon.toLocaleString("sv-SE")} kr/mån`
                  : "saknas i databasen"}
              </strong>
            </p>
            <p className="natverk-tooltip-rad natverk-tooltip-svag">
              {hoverNod.grad} koppling{hoverNod.grad === 1 ? "" : "ar"}
            </p>
          </div>
        )}

        {!mobil && (
          <Minikarta
            noderRef={noderRef}
            transformRef={transformRef}
            storlekRef={storlekRef}
            onHoppa={(x, y) => {
              const canvas = canvasRef.current;
              const zoomBeteende = zoomRef.current;
              if (!canvas || !zoomBeteende) return;
              const { bredd, hojd } = storlekRef.current;
              const k = transformRef.current.k;
              d3.select<HTMLCanvasElement, unknown>(canvas).call(
                zoomBeteende.transform,
                d3.zoomIdentity.translate(bredd / 2 - x * k, hojd / 2 - y * k).scale(k)
              );
            }}
          />
        )}

        <div className={`natverk-legend ${legendOppen ? "oppen" : ""}`}>
          <button
            className="natverk-legend-knapp"
            onClick={() => setLegendOppen((o) => !o)}
            aria-expanded={legendOppen}
          >
            Färgförklaring {legendOppen ? "▾" : "▸"}
          </button>
          {legendOppen && (
            <ul className="natverk-legend-lista">
              {sektorerIBruk.map((s) => (
                <li key={s}>
                  <span
                    className="natverk-legend-prick"
                    style={{ background: SEKTOR_STIL[s]?.farg }}
                  />
                  {SEKTOR_STIL[s]?.namn ?? s}
                </li>
              ))}
              <li className="natverk-legend-not">
                Storlek ={" "}
                {annonserFinns ? "antal lediga jobb" : "antal kopplingar (annonsdata saknas)"}
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- vägpanel */}
      {vagResultat && (
        <div className="natverk-panel natverk-panel-vag">
          <p className="rust-eyebrow">KORTASTE OMSTÄLLNINGSVÄGEN</p>
          <p className="natverk-vag-kedja">
            {vagResultat.vag.map((id, i) => (
              <span key={id}>
                {i > 0 && <span className="natverk-pil"> → </span>}
                <strong>{nodIndex.get(id)?.namn ?? id}</strong>
              </span>
            ))}
          </p>
          <p className="natverk-hjalp">
            {vagResultat.vag.length - 1} steg. Vägen väljs på högst sammanlagt
            kompetensöverlapp, inte på färrast hopp.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------- kantpanel */}
      {valdKant && (
        <div className="natverk-panel">
          <div className="natverk-panel-huvud">
            <p className="rust-eyebrow">VARFÖR FINNS DEN HÄR KOPPLINGEN?</p>
            <button
              className="natverk-knapp natverk-knapp-liten"
              onClick={() => setValdKant(null)}
            >
              Stäng
            </button>
          </div>
          <p className="natverk-panel-titel">
            {nodIndex.get(valdKant.kalla)?.namn} ↔ {nodIndex.get(valdKant.mal)?.namn}
          </p>
          <p className="body-t">
            Substituerbarhet: <strong>{valdKant.score}%</strong> enligt
            Arbetsförmedlingens data.
          </p>
          <ul className="natverk-riktningar">
            {valdKant.riktningar.map((r, i) => (
              <li key={i}>
                {nodIndex.get(r.fran)?.namn}{" "}
                <em>{RIKTNING_TEXT[r.typ] ?? r.typ}</em>{" "}
                {nodIndex.get(r.till)?.namn}
              </li>
            ))}
          </ul>
          {valdKant.delade_kompetenser && valdKant.delade_kompetenser.length > 0 ? (
            <>
              <p className="rust-eyebrow" style={{ marginTop: 14 }}>
                DELADE KOMPETENSER
              </p>
              <ul className="natverk-kompetenser">
                {valdKant.delade_kompetenser.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="natverk-hjalp natverk-varning" style={{ marginTop: 12 }}>
              Listan över delade kompetenser saknas: databasen innehåller ännu inga
              kopplingar mellan yrke och kompetens (REQUIRES-relationer). Kanten
              bygger på Arbetsförmedlingens substituerbarhetspoäng.
            </p>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- nodpanel */}
      {valdNod && !valdKant && (
        <div className="natverk-panel">
          <div className="natverk-panel-huvud">
            <p className="rust-eyebrow">VALT YRKE</p>
            <button
              className="natverk-knapp natverk-knapp-liten"
              onClick={() => setValdNodId(null)}
            >
              Stäng
            </button>
          </div>
          <p className="natverk-panel-titel">{valdNod.namn}</p>
          <p className="body-t">{valdNod.definition}</p>
          <p className="natverk-hjalp">
            SSYK {valdNod.ssyk} ·{" "}
            {SEKTOR_STIL[valdNod.sektor as SektorId]?.namn ?? "Övrigt"} ·{" "}
            {grannarTillVald.size} närliggande yrke
            {grannarTillVald.size === 1 ? "" : "n"}
          </p>
          {grannarTillVald.size > 0 && (
            <ul className="natverk-grannar">
              {Array.from(grannarTillVald).map((id) => (
                <li key={id}>
                  <button type="button" onClick={() => centreraPa(id)}>
                    {nodIndex.get(id)?.namn ?? id}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
