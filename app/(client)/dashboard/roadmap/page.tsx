import { redirect } from "next/navigation";

import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { createClient } from "@/lib/supabase/server";
import { loadRoadmap } from "@/lib/roadmap-data";

export default async function ClientRoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return (
      <div className="py-24 text-center text-[14px] text-muted">
        Aucune organisation associée pour l&apos;instant.
      </div>
    );
  }

  const items = await loadRoadmap(supabase, profile.organization_id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[26px] font-bold text-white">Roadmap de croissance</h1>
        <p className="mt-1 text-[13px] text-muted">
          Local → National → International. Votre consultant valide chaque étape avec vous.
        </p>
      </div>
      <RoadmapView
        items={items}
        organizationId={profile.organization_id}
        interactive={false}
      />
    </div>
  );
}
