"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBar,
  Files,
  LayoutGrid,
  MapPin,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutGrid,
  users: Users,
  sparkles: Sparkles,
  map: MapPin,
  files: Files,
  chart: ChartBar,
  settings: Settings,
};

export type SidebarIcon = keyof typeof ICONS;

export function SidebarLink({
  href,
  icon,
  label,
  badge,
  exact = false,
}: {
  href: string;
  icon: SidebarIcon;
  label: string;
  badge?: string | number;
  exact?: boolean;
}) {
  const Icon = ICONS[icon];
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "group mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
        active
          ? "bg-gold/15 font-semibold text-gold"
          : "text-muted hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon
        size={16}
        strokeWidth={1.6}
        className={cn(active ? "text-gold" : "text-muted group-hover:text-white")}
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="rounded-full bg-ember px-1.5 py-px text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted/80">
        {title}
      </div>
      {children}
    </div>
  );
}
