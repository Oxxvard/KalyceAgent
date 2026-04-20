import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { ScoreRing, scoreColor } from "@/components/ui/score-ring";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationsListPage() {
  const supabase = await createClient();

  const [{ data: orgs }, { data: scores }, { data: checklists }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, sector, current_stage, target_stage, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("scalability_scores")
      .select("organization_id, score, computed_at")
      .order("computed_at", { ascending: false }),
    supabase.from("checklists").select("organization_id, status"),
  ]);

  const latestScore = new Map<string, number>();
  scores?.forEach((s) => {
    if (!latestScore.has(s.organization_id)) latestScore.set(s.organization_id, s.score);
  });

  const STAGE_LABEL: Record<string, string> = {
    local: "Local",
    national: "National",
    international: "International",
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-bold text-white">Clients</h1>
          <p className="mt-1 text-[13px] text-muted">PME accompagnées par le cabinet</p>
        </div>
        <Link
          href="/admin/organizations/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-[12px] font-semibold text-ink hover:bg-gold-soft"
        >
          + Ajouter un client
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {orgs?.map((org) => {
          const score = latestScore.get(org.id) ?? 0;
          const orgChecklists = checklists?.filter((c) => c.organization_id === org.id) ?? [];
          const done = orgChecklists.filter((c) => c.status === "done").length;
          const pct =
            orgChecklists.length > 0 ? Math.round((done / orgChecklists.length) * 100) : 0;
          const badgeTone =
            org.current_stage === "international"
              ? "ember"
              : org.current_stage === "national"
              ? "gold"
              : "muted";

          return (
            <Link
              key={org.id}
              href={`/admin/organizations/${org.id}`}
              className="group flex items-center gap-4 rounded-xl border border-line bg-surface px-5 py-4 transition-all hover:border-gold/30 hover:bg-surface-hover"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[13px] font-semibold text-white">{org.name}</span>
                  <Badge tone={badgeTone as "gold" | "ember" | "muted"}>
                    {STAGE_LABEL[org.current_stage] ?? org.current_stage}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted">{org.sector ?? "—"}</div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="hidden sm:block text-right">
                  <div className="text-[10px] text-muted mb-1">Roadmap</div>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={pct} thickness="sm" className="w-20" />
                    <span className="text-[11px] text-muted">{pct}%</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ScoreRing score={score} size={48} />
                </div>
                <ArrowRight size={15} className="text-muted group-hover:text-gold transition-colors" />
              </div>
            </Link>
          );
        })}
        {!orgs?.length && (
          <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center text-[13px] text-muted">
            Aucun client.{" "}
            <Link href="/admin/organizations/new" className="text-gold hover:underline">
              Créer votre premier client →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
