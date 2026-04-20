import { cn } from "@/lib/utils";

export type BadgeTone =
  | "gold"
  | "ember"
  | "success"
  | "muted"
  | "violet"
  | "info";

const TONES: Record<BadgeTone, string> = {
  gold: "text-gold border-gold/40 bg-gold/10",
  ember: "text-ember border-ember/40 bg-ember/10",
  success: "text-success border-success/40 bg-success/10",
  muted: "text-muted border-line bg-white/5",
  violet: "text-[#a78bfa] border-[#a78bfa]/40 bg-[#a78bfa]/10",
  info: "text-textL border-line bg-white/5",
};

export function Badge({
  tone = "gold",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
