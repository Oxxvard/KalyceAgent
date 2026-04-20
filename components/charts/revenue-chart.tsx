"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { label: string; revenue: number | null };

export function RevenueChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="label" stroke="#8b8778" fontSize={11} />
          <YAxis
            stroke="#8b8778"
            fontSize={11}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
          />
          <Tooltip
            formatter={(value: number) =>
              `${new Intl.NumberFormat("fr-FR").format(value)} €`
            }
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#101416",
              color: "#fff",
              fontSize: 12,
            }}
            labelStyle={{ color: "#d1d5db" }}
            cursor={{ stroke: "rgba(230,196,136,0.3)" }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#e6c488"
            strokeWidth={2}
            dot={{ r: 4, fill: "#e6c488", stroke: "#0b0f10", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#e6c488" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
