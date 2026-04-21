import { KpiCard } from "@/components/ui/kpi-card";
import { ScoreRing, scoreColor } from "@/components/ui/score-ring";
import { ProgressBar } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import { BarChart2, CheckCircle2, TrendingUp, Users } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [{ data: orgs }, { data: scores }, { data: metrics }] = await Promise.all([
    supabase.from("organizations").select("id, name, sector"),
    supabase
      .from("scalability_scores")
      .select("organization_id, score, computed_at")
      .order("computed_at", { ascending: false }),
    supabase
      .from("growth_metrics")
      .select("organization_id, revenue, period_start")
      .order("period_start", { ascending: false }),
  ]);

  // Latest score per org
  const latestScoreByOrg = new Map<string, number>();
  scores?.forEach((s) => {
    if (!latestScoreByOrg.has(s.organization_id))
      latestScoreByOrg.set(s.organization_id, s.score);
  });

  const scoreValues = Array.from(latestScoreByOrg.values());
  const avgScore =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 0;

  // Sector benchmarks
  const sectorMap = new Map<string, { total: number; count: number }>();
  orgs?.forEach((o) => {
    const sector = o.sector ?? "Autre";
    const s = latestScoreByOrg.get(o.id);
    if (s == null) return;
    const curr = sectorMap.get(sector) ?? { total: 0, count: 0 };
    sectorMap.set(sector, { total: curr.total + s, count: curr.count + 1 });
  });
  const benchmarks = Array.from(sectorMap.entries()).map(([sector, { total, count }]) => ({
    sector,
    avgScore: Math.round(total / count),
    clients: count,
  }));

  // MRR history (last 6 months by aggregating per-period)
  const mrrByPeriod = new Map<string, number>();
  metrics?.forEach((m) => {
    if (!m.revenue) return;
    const month = m.period_start.slice(0, 7);
    mrrByPeriod.set(month, (mrrByPeriod.get(month) ?? 0) + Number(m.revenue));
  });
  const mrrHistory = Array.from(mrrByPeriod.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([period, v]) => ({
      month: new Date(period + "-01").toLocaleDateString("fr-FR", { month: "short" }),
      v: Math.round(v / 1000),
    }));
  const maxMrr = Math.max(...mrrHistory.map((d) => d.v), 1);

  const totalMrr = mrrHistory.at(-1)?.v ?? 0;

  const orgScores = orgs
    ?.map((o) => ({ name: o.name, score: latestScoreByOrg.get(o.id) ?? 0 }))
    .filter((o) => o.score > 0);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="font-display text-[26px] font-bold text-white">
          Analytics & Benchmarks
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Performance du portefeuille et référentiels sectoriels
        </p>
      </div>

      {/* KPI row */}
      <div className="flex gap-3 flex-wrap">
        <KpiCard
          label="Score moyen portefeuille"
          value={avgScore > 0 ? `${avgScore}/100` : "—"}
          icon={BarChart2}
        />
        <KpiCard
          label="CA cumulé (dernier mois)"
          value={totalMrr > 0 ? `€${totalMrr}k` : "—"}
          icon={TrendingUp}
        />
        <KpiCard
          label="Clients accompagnés"
          value={orgs?.length ?? 0}
          icon={Users}
        />
        <KpiCard
          label="Scores ≥ 80"
          value={scoreValues.filter((s) => s >= 80).length}
          icon={CheckCircle2}
        />
      </div>

      {/* MRR chart */}
      {mrrHistory.length > 0 && (
        <div className="rounded-xl border border-line bg-surface px-6 py-5">
          <div className="mb-1 text-[14px] font-semibold text-white">Revenus mensuels (€k)</div>
          <div className="mb-4 text-[12px] text-muted">
            {mrrHistory[0]?.month} – {mrrHistory.at(-1)?.month}
          </div>
          <div className="flex items-end gap-2 h-32 pb-2">
            {mrrHistory.map((d, i) => (
              <div
                key={i}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="text-[10px] font-medium text-muted">€{d.v}k</span>
                <div
                  className="w-full overflow-hidden rounded-t"
                  style={{
                    height: `${(d.v / maxMrr) * 70}%`,
                    minHeight: 4,
                    background:
                      i === mrrHistory.length - 1
                        ? "linear-gradient(180deg, #e6c488, #a87a3e)"
                        : "rgba(230,196,136,0.3)",
                  }}
                />
                <span className="text-[10px] text-muted">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sector benchmarks */}
      {benchmarks.length > 0 && (
        <div className="rounded-xl border border-line overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <span className="text-[14px] font-semibold text-white">Benchmarks sectoriels</span>
            <span className="ml-3 text-[11px] text-muted">
              Données portefeuille Kalyce
            </span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Secteur", "Score moy.", "Clients", "Performance"].map((h) => (
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
              {benchmarks.map((b, i) => (
                <tr
                  key={i}
                  className="border-t border-line transition-colors hover:bg-surface-raised"
                >
                  <td className="px-5 py-3 text-[13px] font-medium text-white">{b.sector}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: scoreColor(b.avgScore) }}
                    >
                      {b.avgScore}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-muted">{b.clients}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={b.avgScore} className="w-20" thickness="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Score distribution */}
      {orgScores && orgScores.length > 0 && (
        <div className="rounded-xl border border-line bg-surface px-6 py-5">
          <div className="mb-4 text-[14px] font-semibold text-white">
            Distribution des scores clients
          </div>
          <div className="flex gap-5 flex-wrap">
            {orgScores.map((o) => (
              <div key={o.name} className="flex flex-col items-center gap-2">
                <ScoreRing score={o.score} size={60} />
                <div className="text-center text-[10px] text-muted leading-snug">
                  {o.name.split(" ")[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!benchmarks.length && !mrrHistory.length && (
        <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center text-[13px] text-muted">
          Ajoutez des métriques de croissance pour voir les analytics apparaître ici.
        </div>
      )}
    </div>
  );
}
