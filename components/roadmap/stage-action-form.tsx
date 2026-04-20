"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateChecklistStatus } from "@/app/actions/organizations";

type Status = "pending" | "in_progress" | "done" | "skipped";

function nextStatus(current: Status): Status {
  switch (current) {
    case "pending":
      return "in_progress";
    case "in_progress":
      return "done";
    case "done":
      return "pending";
    default:
      return "pending";
  }
}

export function StageActionForm({
  checklistId,
  organizationId,
  status,
}: {
  checklistId: string;
  organizationId: string;
  status: Status;
}) {
  const [pending, startTransition] = useTransition();

  const handle = (target: Status) => {
    const fd = new FormData();
    fd.set("checklist_id", checklistId);
    fd.set("organization_id", organizationId);
    fd.set("next_status", target);
    startTransition(() => updateChecklistStatus(fd));
  };

  const isDone = status === "done";
  const isActive = status === "in_progress";

  return (
    <button
      disabled={pending}
      onClick={() => handle(nextStatus(status))}
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all",
        isDone
          ? "border-success bg-success text-ink"
          : isActive
          ? "border-gold"
          : "border-line/50 hover:border-gold/50",
        pending && "opacity-50 cursor-wait",
      )}
    >
      {isDone && "✓"}
    </button>
  );
}
