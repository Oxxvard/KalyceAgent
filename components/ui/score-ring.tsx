import { cn } from "@/lib/utils";

export function scoreColor(score: number) {
  if (score >= 75) return "#6ee7b7";
  if (score >= 50) return "#e6c488";
  return "#e8724a";
}

export function scoreLabel(score: number) {
  if (score >= 75) return "Solide";
  if (score >= 50) return "À renforcer";
  return "Prioritaire";
}

export function ScoreRing({
  score,
  size = 64,
  showValue = true,
  className,
}: {
  score: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(score)));
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const pct = safe / 100;
  const color = scoreColor(safe);
  return (
    <svg
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`${color}33`}
        strokeWidth={5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      {showValue && (
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: size >= 80 ? 18 : size >= 60 ? 14 : 11,
            fontWeight: 600,
            fill: "#fff",
            transform: "rotate(90deg)",
            transformOrigin: `${size / 2}px ${size / 2}px`,
          }}
        >
          {safe}
        </text>
      )}
    </svg>
  );
}
