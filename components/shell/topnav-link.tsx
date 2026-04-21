"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  roadmap: ListChecks,
  documents: FileText,
};

export type TopNavIcon = keyof typeof ICONS;

export function TopNavLink({
  href,
  icon,
  label,
  exact = false,
}: {
  href: string;
  icon: TopNavIcon;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const Icon = ICONS[icon];
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors",
        active
          ? "bg-gold/15 font-semibold text-gold"
          : "text-muted hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.6} />
      {label}
    </Link>
  );
}
