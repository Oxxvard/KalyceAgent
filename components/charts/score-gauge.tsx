"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

export function ScoreGauge({ score }: { score: number }) {
  const color = score >= 60 ? "#10B981" : score >= 30 ? "#F59E0B" : "#F43F5E";
  const data = [{ name: "score", value: score, fill: color }];
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
          <RadialBar background={{ fill: "#E2E8F0" }} dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold text-midnight">{score}</span>
        <span className="text-xs uppercase tracking-wide text-slate-deep/60">/ 100</span>
      </div>
    </div>
  );
}
