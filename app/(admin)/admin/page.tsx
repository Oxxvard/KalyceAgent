import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Gauge, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ data: organizations }, { data: checklists }, { data: scores }] = await Promise.all([
    supabase.from("organizations").select("id, name, sector, current_stage, target_stage").order("name"),
    supabase.from("checklists").select("id, organization_id, status"),
    supabase
      .from("scalability_scores")
      .select("organization_id, score, computed_at")
      .order("computed_at", { ascending: false }),
  ]);

  const orgCount = organizations?.length ?? 0;

  const latestScoreByOrg = new Map<string, number>();
  scores?.forEach((s) => {
    if (!latestScoreByOrg.has(s.organization_id)) {
      latestScoreByOrg.set(s.organization_id, s.score);
    }
  });
  const avgScore =
    latestScoreByOrg.size > 0
      ? Math.round(
          Array.from(latestScoreByOrg.values()).reduce((a, b) => a + b, 0) /
            latestScoreByOrg.size,
        )
      : 0;

  const pendingSteps = checklists?.filter((c) => c.status !== "done" && c.status !== "skipped").length ?? 0;
  const completedSteps = checklists?.filter((c) => c.status === "done").length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-midnight">Vue d'ensemble</h1>
        <p className="mt-1 text-sm text-slate-deep/80">
          Pilotage multi-clients de votre cabinet.
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Clients actifs</CardTitle>
            <Users className="h-5 w-5 text-slate-deep/60" />
          </CardHeader>
          <CardValue>{orgCount}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score moyen</CardTitle>
            <Gauge className="h-5 w-5 text-slate-deep/60" />
          </CardHeader>
          <CardValue>{avgScore}/100</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Étapes validées</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-slate-deep/60" />
          </CardHeader>
          <CardValue>{completedSteps}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Étapes en cours</CardTitle>
            <Building2 className="h-5 w-5 text-slate-deep/60" />
          </CardHeader>
          <CardValue>{pendingSteps}</CardValue>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-midnight">Clients</h2>
          <Link
            href="/admin/organizations"
            className="inline-flex items-center gap-1 text-sm font-medium text-midnight hover:underline"
          >
            Voir tous <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {organizations?.slice(0, 6).map((org) => {
              const score = latestScoreByOrg.get(org.id);
              return (
                <li key={org.id}>
                  <Link
                    href={`/admin/organizations/${org.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-soft"
                  >
                    <div>
                      <p className="font-medium text-midnight">{org.name}</p>
                      <p className="text-xs text-slate-deep/70">
                        {org.sector ?? "—"} · {org.current_stage} → {org.target_stage}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {score != null && (
                        <Badge tone={score >= 60 ? "emerald" : score >= 30 ? "amber" : "neutral"}>
                          Score {score}
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </Link>
                </li>
              );
            })}
            {!organizations?.length && (
              <li className="px-6 py-8 text-center text-sm text-slate-deep/60">
                Aucun client pour l'instant.
              </li>
            )}
          </ul>
        </Card>
      </section>
    </div>
  );
}
