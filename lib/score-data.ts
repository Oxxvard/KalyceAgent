import { computeScalabilityScore, type ScoreInput } from "@/lib/scalability-score";
import type { Database, OrgStage } from "@/types/database";

type Supabase = ReturnType<
  typeof import("@supabase/ssr").createServerClient<Database>
>;

export async function buildScoreInput(
  supabase: Supabase,
  orgId: string,
): Promise<ScoreInput | null> {
  const { data: org } = await supabase
    .from("organizations")
    .select("current_stage, target_stage")
    .eq("id", orgId)
    .maybeSingle();

  if (!org) return null;

  const { data: metrics } = await supabase
    .from("growth_metrics")
    .select("revenue, cac, ltv, fte, gross_margin_pct, period_start")
    .eq("organization_id", orgId)
    .order("period_start", { ascending: false })
    .limit(2);

  const latest = metrics?.[0];
  const previous = metrics?.[1];

  const { data: checklists } = await supabase
    .from("checklists")
    .select("status, template:checklist_templates(stage, weight)")
    .eq("organization_id", orgId);

  return {
    metrics: {
      revenue: latest?.revenue ?? undefined,
      cac: latest?.cac ?? undefined,
      ltv: latest?.ltv ?? undefined,
      fte: latest?.fte ?? undefined,
      grossMarginPct: latest?.gross_margin_pct ?? undefined,
    },
    previousRevenue: previous?.revenue ?? undefined,
    currentStage: org.current_stage as OrgStage,
    targetStage: org.target_stage as OrgStage,
    checklist:
      checklists
        ?.filter((c) => c.template)
        .map((c) => ({
          stage: (c.template as unknown as { stage: OrgStage }).stage,
          weight: (c.template as unknown as { weight: number }).weight,
          done: c.status === "done",
        })) ?? [],
  };
}

export async function computeForOrg(supabase: Supabase, orgId: string) {
  const input = await buildScoreInput(supabase, orgId);
  if (!input) return null;
  return { input, result: computeScalabilityScore(input) };
}
