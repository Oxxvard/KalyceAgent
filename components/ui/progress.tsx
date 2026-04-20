import { cn } from "@/lib/utils";

type Tone = "gold" | "ember" | "success" | "muted";

const TONES: Record<Tone, string> = {
  gold: "bg-gradient-to-r from-gold-deep to-gold",
  ember: "bg-ember",
  success: "bg-success",
  muted: "bg-muted",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = "gold",
  thickness = "md",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: Tone;
  thickness?: "sm" | "md" | "lg";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = thickness === "sm" ? "h-1" : thickness === "lg" ? "h-2.5" : "h-1.5";
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-white/8",
        h,
        className,
      )}
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", TONES[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
