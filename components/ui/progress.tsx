import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = "midnight",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "midnight" | "emerald" | "amber";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill =
    tone === "emerald"
      ? "bg-accent-emerald"
      : tone === "amber"
        ? "bg-accent-amber"
        : "bg-midnight";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
