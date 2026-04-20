import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { createClient } from "@/lib/supabase/server";
import { loadRoadmap } from "@/lib/roadmap-data";

export default async function OrgRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const items = await loadRoadmap(supabase, id);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-[20px] font-bold text-white">Roadmap de croissance</h2>
        <p className="mt-1 text-[13px] text-muted">
          Validez les étapes — le score et la progression du client se mettent à jour
          automatiquement.
        </p>
      </div>
      <RoadmapView items={items} organizationId={id} interactive />
    </div>
  );
}
