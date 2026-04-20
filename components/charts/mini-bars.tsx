"use client";

import { cn } from "@/lib/utils";

export type BarDatum = {
  label: string;
  value: number;
  label2?: string;
  active?: boolean;
};

export function MiniBars({
  data,
  height = 120,
  className,
}: {
  data: BarDatum[];
  height?: number;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div
      className={cn("flex items-end gap-2 pb-2", className)}
      style={{ height }}
    >
      {data.map((d, i) => {
        const h = `${(d.value / max) * 80}%`;
        return (
          <div
            key={i}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[10px] font-medium text-muted">
              {d.label2 ?? ""}
            </span>
            <div
              className={cn(
                "w-full overflow-hidden rounded-t",
                d.active
                  ? "bg-gradient-to-t from-gold-deep to-gold"
                  : "bg-gold/30",
              )}
              style={{ height: h, minHeight: 4, transition: "height 0.6s ease" }}
            />
            <span className="text-[10px] text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
