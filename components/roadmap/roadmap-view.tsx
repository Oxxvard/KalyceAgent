import { Check, Circle, MinusCircle, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { StageActionForm } from "./stage-action-form";

export type RoadmapItem = {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  position: number;
  stage: "local" | "national" | "international";
  weight: number;
  status: "pending" | "in_progress" | "done" | "skipped";
  validatedAt: string | null;
};

const STAGE_LABEL: Record<"local" | "national" | "international", string> = {
  local: "Local",
  national: "National",
  international: "International",
};

function StatusIcon({ status }: { status: RoadmapItem["status"] }) {
  switch (status) {
    case "done":
      return <Check className="h-5 w-5 text-accent-emerald" />;
    case "in_progress":
      return <Play className="h-5 w-5 text-accent-amber" />;
    case "skipped":
      return <MinusCircle className="h-5 w-5 text-slate-400" />;
    default:
      return <Circle className="h-5 w-5 text-slate-300" />;
  }
}

export function RoadmapView({
  items,
  organizationId,
  interactive,
}: {
  items: RoadmapItem[];
  organizationId: string;
  interactive: boolean;
}) {
  const stages: ("local" | "national" | "international")[] = ["local", "national", "international"];

  return (
    <div className="space-y-10">
      {stages.map((stage) => {
        const stageItems = items.filter((i) => i.stage === stage).sort((a, b) => a.position - b.position);
        const totalWeight = stageItems.reduce((sum, i) => sum + i.weight, 0);
        const doneWeight = stageItems
          .filter((i) => i.status === "done")
          .reduce((sum, i) => sum + i.weight, 0);
        const pct = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;

        return (
          <section key={stage}>
            <header className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-midnight">{STAGE_LABEL[stage]}</h2>
                <Badge tone={pct === 100 ? "emerald" : pct > 0 ? "amber" : "neutral"}>
                  {pct}% complété
                </Badge>
              </div>
              <span className="text-xs text-slate-deep/60">
                {stageItems.filter((i) => i.status === "done").length}/{stageItems.length} étapes
              </span>
            </header>
            <div className="mb-4">
              <ProgressBar value={pct} tone={pct === 100 ? "emerald" : "midnight"} />
            </div>

            <ol className="space-y-2">
              {stageItems.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-card",
                    item.status === "done" && "border-emerald-200 bg-emerald-50/40",
                  )}
                >
                  <div className="mt-0.5">
                    <StatusIcon status={item.status} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-midnight">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 text-sm text-slate-deep/70">{item.description}</p>
                    )}
                    {item.validatedAt && (
                      <p className="mt-1 text-xs text-accent-emerald">
                        Validé le {new Date(item.validatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                  {interactive && (
                    <StageActionForm
                      checklistId={item.id}
                      organizationId={organizationId}
                      status={item.status}
                    />
                  )}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
