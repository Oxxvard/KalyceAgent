"use client";

import { useTransition } from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { recomputeScore } from "@/app/actions/organizations";

export function RecomputeButton({ orgId }: { orgId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => recomputeScore(orgId))}
    >
      <RefreshCcw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Calcul…" : "Recalculer le score"}
    </Button>
  );
}
