"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function TopNavLink({
  href,
  icon: Icon,
  label,
  exact = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-midnight/10 text-midnight"
          : "text-slate-deep/70 hover:bg-slate-100 hover:text-midnight",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
