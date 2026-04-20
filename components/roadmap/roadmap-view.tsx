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
  local: "Diagnostic Local",
  national: "Expansion Nationale",
  international: "Internationalisation",
};

const STAGE_PHASE: Record<"local" | "national" | "international", string> = {
  local: "Phase 1",
  national: "Phase 2",
  international: "Phase 3",
};

export function RoadmapView({
  items,
  organizationId,
  interactive,
}: {
  items: RoadmapItem[];
  organizationId: string;
  interactive: boolean;
}) {
  const stages: ("local" | "national" | "international")[] = [
    "local",
    "national",
    "international",
  ];

  const totalDone = items.filter((i) => i.status === "done").length;
  const totalItems = items.length;
  const globalPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Global progress card */}
      <div className="rounded-xl border border-line bg-surface px-5 py-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[13px] font-medium text-white">
            Progression globale
          </span>
          <span className="text-[13px] font-bold text-gold">{globalPct}% complété</span>
        </div>
        <ProgressBar value={globalPct} thickness="lg" />
        <div className="mt-2.5 flex gap-4 text-[11px]">
          <span className="text-success">{totalDone} complétées</span>
          <span className="text-gold">
            {items.filter((i) => i.status === "in_progress").length} en cours
          </span>
          <span className="text-muted">
            {items.filter((i) => i.status === "pending").length} à venir
          </span>
        </div>
      </div>

      {/* Stages */}
      {stages.map((stage) => {
        const stageItems = items
          .filter((i) => i.stage === stage)
          .sort((a, b) => a.position - b.position);
        if (stageItems.length === 0) return null;

        const totalWeight = stageItems.reduce((sum, i) => sum + i.weight, 0);
        const doneWeight = stageItems
          .filter((i) => i.status === "done")
          .reduce((sum, i) => sum + i.weight, 0);
        const pct = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;

        return (
          <section key={stage}>
            {/* Stage header */}
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-4 bg-gold" />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gold">
                {STAGE_PHASE[stage]} — {STAGE_LABEL[stage]}
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(230,196,136,0.2)" }} />
            </div>

            <ol className="space-y-2">
              {stageItems.map((item) => {
                const isDone = item.status === "done";
                const isActive = item.status === "in_progress";
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3.5 rounded-xl border px-4 py-3.5 transition-all",
                      isDone
                        ? "border-success/30 bg-success/5"
                        : isActive
                        ? "border-gold/40 bg-gold/10"
                        : "border-line bg-surface",
                    )}
                  >
                    {/* Circle toggle */}
                    {interactive ? (
                      <StageActionForm
                        checklistId={item.id}
                        organizationId={organizationId}
                        status={item.status}
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                          isDone
                            ? "border-success bg-success text-ink text-[10px]"
                            : isActive
                            ? "border-gold"
                            : "border-line/50",
                        )}
                      >
                        {isDone && "✓"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-[13px]",
                          isDone
                            ? "font-normal text-muted line-through"
                            : isActive
                            ? "font-semibold text-white"
                            : "font-normal text-textL",
                        )}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-0.5 text-[11px] text-muted">{item.description}</p>
                      )}
                      {item.validatedAt && (
                        <p className="mt-0.5 text-[11px] text-success">
                          Validé le {new Date(item.validatedAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>

                    {isDone && (
                      <Badge tone="success">Fait</Badge>
                    )}
                    {isActive && (
                      <Badge tone="gold">En cours</Badge>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
