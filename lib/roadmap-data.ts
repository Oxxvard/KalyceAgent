import type { RoadmapItem } from "@/components/roadmap/roadmap-view";
import type { Database } from "@/types/database";

type Supabase = ReturnType<
  typeof import("@supabase/ssr").createServerClient<Database>
>;

export async function loadRoadmap(
  supabase: Supabase,
  organizationId: string,
): Promise<RoadmapItem[]> {
  const { data } = await supabase
    .from("checklists")
    .select(
      "id, template_id, status, validated_at, template:checklist_templates(title, description, position, stage, weight)",
    )
    .eq("organization_id", organizationId);

  return (data ?? [])
    .map((c) => {
      const t = c.template as unknown as {
        title: string;
        description: string | null;
        position: number;
        stage: "local" | "national" | "international";
        weight: number;
      } | null;
      if (!t) return null;
      return {
        id: c.id,
        templateId: c.template_id,
        title: t.title,
        description: t.description,
        position: t.position,
        stage: t.stage,
        weight: t.weight,
        status: c.status,
        validatedAt: c.validated_at,
      } satisfies RoadmapItem;
    })
    .filter((item): item is RoadmapItem => item !== null);
}
