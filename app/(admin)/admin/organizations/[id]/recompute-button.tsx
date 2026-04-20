"use client";

import { useTransition } from "react";
import { RefreshCcw } from "lucide-react";

import { recomputeScore } from "@/app/actions/organizations";

export function RecomputeButton({ orgId }: { orgId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => recomputeScore(orgId))}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[11px] font-medium text-textL transition-colors hover:bg-surface-hover hover:text-white disabled:opacity-50"
    >
      <RefreshCcw size={12} strokeWidth={1.6} className={pending ? "animate-spin" : ""} />
      {pending ? "Calcul…" : "Recalculer"}
    </button>
  );
}
