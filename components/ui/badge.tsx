import { cn } from "@/lib/utils";

type Tone = "neutral" | "emerald" | "amber" | "midnight";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-deep",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  midnight: "bg-midnight/10 text-midnight",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
