import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { createClient } from "@/lib/supabase/server";
import { loadRoadmap } from "@/lib/roadmap-data";

export default async function OrgRoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const items = await loadRoadmap(supabase, id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-midnight">Roadmap</h2>
        <p className="text-sm text-slate-deep/70">
          Validez les étapes au fur et à mesure — le score et la progression du client se mettent à jour automatiquement.
        </p>
      </div>
      <RoadmapView items={items} organizationId={id} interactive />
    </div>
  );
}
