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
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-slate-deep/80">Aucune organisation associée pour l'instant.</p>
      </div>
    );
  }

  const items = await loadRoadmap(supabase, profile.organization_id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-midnight">Roadmap de croissance</h1>
        <p className="mt-1 text-sm text-slate-deep/80">
          Local → National → International. Votre consultant valide chaque étape avec vous.
        </p>
      </header>
      <RoadmapView items={items} organizationId={profile.organization_id} interactive={false} />
    </div>
  );
}
