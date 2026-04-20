"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
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

const LABELS: Record<Status, string> = {
  pending: "Démarrer",
  in_progress: "Valider",
  done: "Réinitialiser",
  skipped: "Réactiver",
};

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

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        variant={status === "done" ? "secondary" : "primary"}
        disabled={pending}
        onClick={() => handle(nextStatus(status))}
      >
        {LABELS[status]}
      </Button>
      {status !== "skipped" && status !== "done" && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => handle("skipped")}>
          Ignorer
        </Button>
      )}
    </div>
  );
}
