export function KalyceLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? 36 : size === "sm" ? 24 : 28;
  const text = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";
  const mark = size === "lg" ? "text-lg" : size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center rounded-md bg-gradient-to-br from-gold to-gold-deep font-bold text-ink ${mark}`}
        style={{ width: dim, height: dim }}
      >
        K
      </div>
      <span className={`font-display font-bold tracking-tight text-white ${text}`}>
        Kalyce
      </span>
    </div>
  );
}
