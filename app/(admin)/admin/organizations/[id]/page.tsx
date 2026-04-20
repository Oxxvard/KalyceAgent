import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { createClient } from "@/lib/supabase/server";
import { computeForOrg } from "@/lib/score-data";
import { scoreColor } from "@/components/ui/score-ring";

import { RecomputeButton } from "./recompute-button";

const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: metrics }, scoreData, { data: checklists }] = await Promise.all([
    supabase
      .from("growth_metrics")
      .select("period_start, period_end, revenue, cac, ltv, fte, gross_margin_pct")
      .eq("organization_id", id)
      .order("period_start", { ascending: true }),
    computeForOrg(supabase, id),
    supabase
      .from("checklists")
      .select("status, template:checklist_templates(stage, title, position)")
      .eq("organization_id", id),
  ]);

  if (!scoreData) notFound();

  const chart = (metrics ?? []).map((m) => ({
    label: new Date(m.period_start).toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    }),
    revenue: m.revenue == null ? null : Number(m.revenue),
  }));

  const latest = metrics?.[metrics.length - 1];

  const upcoming = (checklists ?? [])
    .filter((c) => c.status !== "done" && c.status !== "skipped")
    .map((c) => ({
      title: (c.template as unknown as { title: string })?.title ?? "",
      stage: (c.template as unknown as { stage: string })?.stage ?? "",
      position: (c.template as unknown as { position: number })?.position ?? 0,
    }))
    .sort((a, b) => a.position - b.position)
    .slice(0, 5);

  const total = scoreData.result.total;

  const kpis = [
    {
      label: "CA dernière période",
      value: latest?.revenue ? EUR.format(Number(latest.revenue)) : "—",
    },
    {
      label: "LTV / CAC",
      value:
        scoreData.result.details.ltvCacRatio != null
          ? `${scoreData.result.details.ltvCacRatio.toFixed(1)}×`
          : "—",
    },
    {
      label: "Marge brute",
      value:
        latest?.gross_margin_pct != null
          ? `${Number(latest.gross_margin_pct).toFixed(1)}%`
          : "—",
    },
    {
      label: "ETP",
      value: latest?.fte != null ? Number(latest.fte).toFixed(1) : "—",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top: score + revenue */}
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-muted uppercase tracking-[0.06em]">
              Scalability Score
            </span>
            <RecomputeButton orgId={id} />
          </div>
          <ScoreGauge score={total} />
          <div className="mt-5 space-y-3">
            <ScoreLine label="Financier" value={scoreData.result.financial} max={40} />
            <ScoreLine label="Opérationnel" value={scoreData.result.operational} max={30} />
            <ScoreLine label="Maturité" value={scoreData.result.maturity} max={30} />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-white">
              Chiffre d&apos;affaires
            </span>
            <Badge tone="muted">{metrics?.length ?? 0} périodes</Badge>
          </div>
          {chart.length > 0 ? (
            <RevenueChart data={chart} />
          ) : (
            <p className="py-16 text-center text-[13px] text-muted">
              Aucune métrique saisie.
            </p>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-line bg-surface px-5 py-4"
          >
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">
              {k.label}
            </div>
            <div className="text-[22px] font-semibold text-white">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Upcoming steps */}
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <span className="text-[13px] font-semibold text-white">Prochaines étapes</span>
        </div>
        {upcoming.length > 0 ? (
          <ul>
            {upcoming.map((step, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between border-b border-line px-5 py-3 last:border-0 transition-colors hover:bg-surface-raised"
              >
                <div>
                  <p className="text-[13px] font-medium text-white">{step.title}</p>
                  <p className="text-[11px] text-muted capitalize">{step.stage}</p>
                </div>
                <Badge tone="gold">À valider</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-[13px] text-muted">
            Roadmap entièrement validée. ✓
          </p>
        )}
      </div>
    </div>
  );
}

function ScoreLine({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12px]">
        <span className="text-textL">{label}</span>
        <span className="font-semibold" style={{ color: scoreColor((value / max) * 100) }}>
          {value}/{max}
        </span>
      </div>
      <ProgressBar value={value} max={max} tone="gold" thickness="sm" />
    </div>
  );
}
