// Hardcoded career graph for the Omställningsanalys canvas animation.
// 44 nodes positioned on a 600×380 grid, ~16% marked as shortage occupations.
// Edges represent ESCO substitutability connections (illustrative).
// TODO: Replace with live data from /kompetensgrafen/career-graph endpoint
//       once the Neo4j graph has full SUBSTITUTABLE_BY coverage.

export interface GraphNode {
  x: number; y: number; label: string; shortage: boolean;
}
export interface GraphEdge {
  from: number; to: number; w: number;
}

// 7 rows × (6-7 nodes) = 44 nodes. shortage=true marks bristyrken.
export const NODES: GraphNode[] = [
  // Row 1 — y ≈ 40
  { x: 58,  y: 40,  label: "Handelsbiträde",     shortage: false },
  { x: 140, y: 32,  label: "Säljare",             shortage: false },
  { x: 222, y: 48,  label: "Kassapersonal",       shortage: false },
  { x: 304, y: 36,  label: "Lagerarbetare",       shortage: false },
  { x: 386, y: 44,  label: "Truckförare",         shortage: false },
  { x: 468, y: 30,  label: "Logistikoperatör",    shortage: false },
  { x: 548, y: 46,  label: "Godshanterare",       shortage: false },
  // Row 2 — y ≈ 94
  { x: 58,  y: 94,  label: "Processoperatör",     shortage: false },
  { x: 140, y: 88,  label: "Maskinoperatör",      shortage: false },
  { x: 222, y: 98,  label: "Produktionstekniker", shortage: false },
  { x: 304, y: 90,  label: "Kvalitetskontrollant",shortage: false },
  { x: 386, y: 96,  label: "Underhållstekniker",  shortage: false },
  { x: 468, y: 86,  label: "Automationstekniker", shortage: true  },
  { x: 548, y: 100, label: "CNC-operatör",        shortage: false },
  // Row 3 — y ≈ 148
  { x: 72,  y: 148, label: "Städpersonal",        shortage: false },
  { x: 168, y: 140, label: "Servicetekniker",     shortage: false },
  { x: 264, y: 152, label: "Fastighetsskötare",   shortage: false },
  { x: 360, y: 144, label: "Vaktmästare",         shortage: false },
  { x: 456, y: 150, label: "Köksbiträde",         shortage: false },
  { x: 548, y: 142, label: "Restaurangbiträde",   shortage: false },
  // Row 4 — y ≈ 200
  { x: 72,  y: 200, label: "Barnskötare",         shortage: false },
  { x: 168, y: 194, label: "Personlig assistent", shortage: false },
  { x: 264, y: 204, label: "Vårdbiträde",         shortage: false },
  { x: 360, y: 196, label: "Undersköterska",      shortage: true  },
  { x: 456, y: 206, label: "Spec.undersköterska", shortage: true  },
  { x: 548, y: 198, label: "Sjuksköterska",       shortage: true  },
  // Row 5 — y ≈ 255
  { x: 72,  y: 255, label: "Snickare",            shortage: false },
  { x: 168, y: 248, label: "Elektriker",          shortage: true  },
  { x: 264, y: 260, label: "Rörmokare",           shortage: false },
  { x: 360, y: 252, label: "Betongarbetare",      shortage: false },
  { x: 456, y: 258, label: "Lärare",              shortage: true  },
  { x: 548, y: 250, label: "Förskollärare",       shortage: false },
  // Row 6 — y ≈ 310
  { x: 72,  y: 310, label: "Receptionist",        shortage: false },
  { x: 168, y: 302, label: "Ekonomiassistent",    shortage: false },
  { x: 264, y: 314, label: "HR-specialist",       shortage: false },
  { x: 360, y: 306, label: "Systemutvecklare",    shortage: true  },
  { x: 456, y: 312, label: "Dataingenjör",        shortage: false },
  { x: 548, y: 304, label: "IT-tekniker",         shortage: false },
  // Row 7 — y ≈ 362
  { x: 72,  y: 362, label: "Butiksbiträde",       shortage: false },
  { x: 168, y: 356, label: "Frisör",              shortage: false },
  { x: 264, y: 368, label: "Bagare",              shortage: false },
  { x: 360, y: 360, label: "Kock",                shortage: true  },
  { x: 456, y: 366, label: "Kökschef",            shortage: false },
  { x: 548, y: 358, label: "Florist",             shortage: false },
];

export const EDGES: GraphEdge[] = [
  { from: 0,  to: 1,  w: 0.74 }, { from: 1,  to: 3,  w: 0.81 },
  { from: 3,  to: 4,  w: 0.68 }, { from: 4,  to: 5,  w: 0.72 },
  { from: 0,  to: 14, w: 0.55 }, { from: 14, to: 20, w: 0.77 },
  { from: 20, to: 21, w: 0.88 }, { from: 21, to: 22, w: 0.91 },
  { from: 22, to: 23, w: 0.85 }, { from: 23, to: 24, w: 0.79 },
  { from: 24, to: 25, w: 0.65 }, { from: 3,  to: 20, w: 0.62 },
  { from: 7,  to: 8,  w: 0.76 }, { from: 8,  to: 11, w: 0.70 },
  { from: 11, to: 12, w: 0.83 }, { from: 26, to: 27, w: 0.69 },
  { from: 27, to: 30, w: 0.58 }, { from: 32, to: 33, w: 0.71 },
  { from: 33, to: 35, w: 0.64 }, { from: 38, to: 39, w: 0.73 },
  { from: 39, to: 41, w: 0.80 }, { from: 15, to: 16, w: 0.67 },
  { from: 16, to: 26, w: 0.61 }, { from: 2,  to: 14, w: 0.59 },
];

// Animated highlight: Handelsbiträde → Lagerarbetare → Barnskötare → Undersköterska → Spec.undersköterska
export const HIGHLIGHT_PATH = [0, 3, 20, 23, 24];

// Top 5 transitions displayed in the right column
export const TOP_TRANSITIONS = [
  { from: "Handelsbiträde",    to: "Undersköterska",       pct: 85 },
  { from: "Lagerarbetare",     to: "Spec.undersköterska",  pct: 81 },
  { from: "Barnskötare",       to: "Sjuksköterska",        pct: 74 },
  { from: "Maskinoperatör",    to: "Automationstekniker",  pct: 83 },
  { from: "Butiksbiträde",     to: "Kock",                 pct: 80 },
];
