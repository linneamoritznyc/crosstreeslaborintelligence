interface ScoreBarProps {
  score: number;
  max?: number;
  label?: string;
}

export function ScoreBar({ score, max = 100, label }: ScoreBarProps) {
  const pct = Math.min(100, (score / max) * 100);

  return (
    <div role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={max}>
      {label && <span>{label}</span>}
      <div style={{ width: "100%", background: "#e0e0e0", borderRadius: 4, height: 8 }}>
        <div
          style={{
            width: `${pct}%`,
            background: pct >= 70 ? "#2e7d32" : pct >= 40 ? "#f57c00" : "#c62828",
            borderRadius: 4,
            height: 8,
          }}
        />
      </div>
      <span>{score}%</span>
    </div>
  );
}
