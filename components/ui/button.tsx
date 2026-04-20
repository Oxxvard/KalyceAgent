import { cn } from "@/lib/utils";

type Variant = "gold" | "ghost" | "ember" | "outline";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  gold: "bg-gold text-ink hover:bg-gold-soft",
  ghost: "border border-line bg-surface text-textL hover:bg-surface-hover hover:border-line-strong",
  ember: "bg-ember text-white hover:bg-ember-soft",
  outline: "border border-gold/50 bg-gold/10 text-gold hover:bg-gold/15",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  className,
  variant = "gold",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}
