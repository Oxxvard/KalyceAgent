"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { scoreColor, scoreLabel } from "@/components/ui/score-ring";

export function ScoreGauge({ score }: { score: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(score)));
  const color = scoreColor(safe);
  const data = [{ name: "score", value: safe, fill: color }];
  return (
    <div className="relative h-48 w-full">
      <ResponsiveContainer>
        <RadialBarChart
          innerRadius="75%"
          outerRadius="100%"
          data={data}
          startAngle={210}
          endAngle={-30}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: "rgba(255,255,255,0.06)" }}
            dataKey="value"
            cornerRadius={8}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold text-white">{safe}</span>
        <span className="text-[10px] uppercase tracking-[0.1em] text-muted">/ 100</span>
        <span
          className="mt-1 text-[11px] font-semibold"
          style={{ color }}
        >
          {scoreLabel(safe)}
        </span>
      </div>
    </div>
  );
}
