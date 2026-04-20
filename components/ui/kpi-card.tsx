import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  deltaUp,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-[160px] flex-1 rounded-xl border border-line bg-surface p-5 transition-colors hover:bg-surface-hover",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">
          {label}
        </span>
        {Icon && <Icon size={16} className="text-gold/80" strokeWidth={1.5} />}
      </div>
      <div className="text-[28px] font-semibold leading-none text-white">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-2 text-[11px] font-medium",
            deltaUp ? "text-success" : "text-ember",
          )}
        >
          {deltaUp ? "↑" : "↓"} {delta}
        </div>
      )}
    </div>
  );
}
