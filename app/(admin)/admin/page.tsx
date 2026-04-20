import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { ScoreRing, scoreColor, scoreLabel } from "@/components/ui/score-ring";
import { ProgressBar } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ data: organizations }, { data: checklists }, { data: scores }, { data: metrics }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("id, name, sector, current_stage, target_stage, consultant_id, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("checklists").select("id, organization_id, status"),
      supabase
        .from("scalability_scores")
        .select("organization_id, score, computed_at")
        .order("computed_at", { ascending: false }),
      supabase
        .from("growth_metrics")
        .select("organization_id, revenue, period_start")
        .order("period_start", { ascending: false }),
    ]);

  const orgCount = organizations?.length ?? 0;
  const activeCount = orgCount;

  const latestScoreByOrg = new Map<string, number>();
  scores?.forEach((s) => {
    if (!latestScoreByOrg.has(s.organization_id))
      latestScoreByOrg.set(s.organization_id, s.score);
  });

  const avgScore =
    latestScoreByOrg.size > 0
      ? Math.round(
          Array.from(latestScoreByOrg.values()).reduce((a, b) => a + b, 0) /
            latestScoreByOrg.size,
        )
      : 0;

  const completedSteps = checklists?.filter((c) => c.status === "done").length ?? 0;
  const totalSteps = checklists?.length ?? 0;

  const latestMrrByOrg = new Map<string, number>();
  metrics?.forEach((m) => {
    if (!latestMrrByOrg.has(m.organization_id) && m.revenue)
      latestMrrByOrg.set(m.organization_id, Number(m.revenue));
  });
  const totalMrr = Array.from(latestMrrByOrg.values()).reduce((a, b) => a + b, 0);

  const STAGE_LABEL: Record<string, string> = {
    local: "Local",
    national: "National",
    international: "International",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-[13px] text-muted">
            Vue d&apos;ensemble du portefeuille — {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-[12px] text-textL hover:bg-surface-hover">
            <RefreshCw size={13} strokeWidth={1.6} /> Exporter
          </button>
          <Link
            href="/admin/organizations/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-[12px] font-semibold text-ink hover:bg-gold-soft"
          >
            + Nouveau client
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <KpiCard
          label="MRR Total"
          value={`€${totalMrr > 0 ? (totalMrr / 1000).toFixed(0) : "—"}k`}
          delta="+12% vs M-1"
          deltaUp
          icon={TrendingUp}
        />
        <KpiCard
          label="Clients actifs"
          value={activeCount}
          delta="+1 ce mois"
          deltaUp
          icon={Users}
        />
        <KpiCard
          label="Score moyen"
          value={`${avgScore}/100`}
          delta="+3 pts"
          deltaUp
          icon={TrendingUp}
        />
        <KpiCard
          label="Étapes validées"
          value={completedSteps}
          delta={totalSteps > 0 ? `sur ${totalSteps} total` : undefined}
          icon={CheckCircle2}
        />
      </div>

      {/* Clients table */}
      <div className="rounded-xl border border-line overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <span className="text-[14px] font-semibold text-white">Portefeuille clients</span>
          <Link
            href="/admin/organizations"
            className="text-[12px] font-medium text-gold hover:text-gold-soft"
          >
            Voir tout →
          </Link>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              {["Entreprise", "Secteur", "Stade", "Score", "Roadmap", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {organizations?.slice(0, 6).map((org) => {
              const score = latestScoreByOrg.get(org.id) ?? 0;
              const orgChecklists = checklists?.filter((c) => c.organization_id === org.id) ?? [];
              const done = orgChecklists.filter((c) => c.status === "done").length;
              const pct = orgChecklists.length > 0 ? Math.round((done / orgChecklists.length) * 100) : 0;
              const badgeTone =
                org.current_stage === "international"
                  ? "ember"
                  : org.current_stage === "national"
                  ? "gold"
                  : "muted";

              return (
                <tr
                  key={org.id}
                  className="border-t border-line transition-colors hover:bg-surface-raised"
                >
                  <td className="px-5 py-3">
                    <div className="text-[13px] font-medium text-white">{org.name}</div>
                    <div className="text-[11px] text-muted">{org.sector ?? "—"}</div>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-textL">{org.sector ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge tone={badgeTone as "gold" | "ember" | "muted"}>
                      {STAGE_LABEL[org.current_stage] ?? org.current_stage}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1 w-16 overflow-hidden rounded-full"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${score}%`, background: scoreColor(score) }}
                        />
                      </div>
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: scoreColor(score) }}
                      >
                        {score > 0 ? score : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={pct} thickness="sm" className="w-20" />
                      <span className="text-[11px] text-muted">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="text-muted hover:text-gold"
                    >
                      <ArrowRight size={15} strokeWidth={1.6} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!organizations?.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-[13px] text-muted"
                >
                  Aucun client pour l&apos;instant.{" "}
                  <Link href="/admin/organizations/new" className="text-gold hover:underline">
                    Créer votre premier client →
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
