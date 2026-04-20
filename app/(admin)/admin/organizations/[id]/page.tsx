import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { createClient } from "@/lib/supabase/server";
import { computeForOrg } from "@/lib/score-data";

import { RecomputeButton } from "./recompute-button";

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default async function OrgOverviewPage({ params }: { params: Promise<{ id: string }> }) {
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
    label: new Date(m.period_start).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
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

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Scalability Score</CardTitle>
            <RecomputeButton orgId={id} />
          </CardHeader>
          <ScoreGauge score={scoreData.result.total} />
          <div className="mt-4 space-y-3 text-sm">
            <ScoreLine label="Financier" value={scoreData.result.financial} max={40} tone="midnight" />
            <ScoreLine label="Opérationnel" value={scoreData.result.operational} max={30} tone="emerald" />
            <ScoreLine label="Maturité" value={scoreData.result.maturity} max={30} tone="amber" />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chiffre d'affaires</CardTitle>
            <Badge tone="midnight">{metrics?.length ?? 0} périodes</Badge>
          </CardHeader>
          {chart.length > 0 ? (
            <RevenueChart data={chart} />
          ) : (
            <p className="py-12 text-center text-sm text-slate-deep/60">
              Aucune métrique saisie.
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>CA dernière période</CardTitle>
          </CardHeader>
          <CardValue>{latest?.revenue ? EUR.format(Number(latest.revenue)) : "—"}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>LTV / CAC</CardTitle>
          </CardHeader>
          <CardValue>
            {scoreData.result.details.ltvCacRatio != null
              ? `${scoreData.result.details.ltvCacRatio.toFixed(1)}×`
              : "—"}
          </CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Marge brute</CardTitle>
          </CardHeader>
          <CardValue>
            {latest?.gross_margin_pct != null ? `${Number(latest.gross_margin_pct).toFixed(1)}%` : "—"}
          </CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ETP</CardTitle>
          </CardHeader>
          <CardValue>{latest?.fte != null ? Number(latest.fte).toFixed(1) : "—"}</CardValue>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prochaines étapes</CardTitle>
        </CardHeader>
        {upcoming.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((step, idx) => (
              <li key={idx} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-midnight">{step.title}</p>
                  <p className="text-xs text-slate-deep/60">{step.stage}</p>
                </div>
                <Badge>À valider</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-slate-deep/60">Roadmap entièrement validée.</p>
        )}
      </Card>
    </div>
  );
}

function ScoreLine({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "midnight" | "emerald" | "amber";
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-deep/70">{label}</span>
        <span className="font-medium text-midnight">
          {value}/{max}
        </span>
      </div>
      <ProgressBar value={value} max={max} tone={tone} />
    </div>
  );
}
