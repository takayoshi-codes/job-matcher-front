"use client";

interface ScoreGaugeProps {
  score: number;
  label: string;
  color?: string;
}

export default function ScoreGauge({ score, label, color }: ScoreGaugeProps) {
  const pct = Math.round(score * 100);
  const c = color ?? (pct >= 70 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626");
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#f0ede8" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={c} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="65" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill={c}>
          {pct}%
        </text>
        <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#888">
          {label}
        </text>
      </svg>
    </div>
  );
}
