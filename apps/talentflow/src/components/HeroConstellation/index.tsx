/* Cartographic constellation background — fine nodes and edges on parchment.
   Deterministic seed so SSR and client agree. */

const NODES: Array<{ x: number; y: number; r: number }> = (() => {
  const seed = (i: number) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const list = [];
  for (let i = 0; i < 60; i++) {
    list.push({
      x: seed(i * 2 + 1) * 1600,
      y: seed(i * 2 + 2) * 900,
      r: 1.4 + seed(i * 2 + 3) * 2.2,
    });
  }
  return list;
})();

const EDGES: Array<{ a: number; b: number }> = (() => {
  const list: Array<{ a: number; b: number }> = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      const dx = NODES[i].x - NODES[j].x;
      const dy = NODES[i].y - NODES[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 220) list.push({ a: i, b: j });
    }
  }
  return list;
})();

export default function HeroConstellation() {
  return (
    <svg
      className="hero-constellation"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Faint depth-sounding contour lines */}
      {[180, 360, 540, 720].map((y) => (
        <path
          key={y}
          d={`M 0 ${y} Q 400 ${y - 24}, 800 ${y} T 1600 ${y}`}
          stroke="#c8bfae"
          strokeWidth="0.6"
          fill="none"
          opacity="0.55"
        />
      ))}

      {EDGES.map((e, i) => {
        const a = NODES[e.a];
        const b = NODES[e.b];
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#b4a98e"
            strokeWidth="0.4"
            opacity="0.45"
          />
        );
      })}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="#7a6f55" opacity="0.55" />
      ))}

      {/* Coordinate ticks like a chart edge */}
      <g fontFamily="Courier Prime, monospace" fontSize="10" fill="#7a6f55" opacity="0.55">
        <text x="1100" y="200">— 42 m</text>
        <text x="980" y="380">— 24 m</text>
      </g>
    </svg>
  );
}
