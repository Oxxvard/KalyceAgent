import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { createClient } from "@/lib/supabase/server";
import { computeForOrg } from "@/lib/score-data";
import { loadRoadmap } from "@/lib/roadmap-data";

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, organization:organizations(id, name, current_stage, target_stage)")
    .eq("id", user.id)
    .maybeSingle();

  const org = profile?.organization as unknown as
    | { id: string; name: string; current_stage: string; target_stage: string }
    | null;
  if (!org) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-slate-deep/80">
          Votre consultant n'a pas encore associé votre compte à une organisation.
        </p>
      </div>
    );
  }

  const [scoreData, { data: metrics }, roadmap] = await Promise.all([
    computeForOrg(supabase, org.id),
    supabase
      .from("growth_metrics")
      .select("period_start, revenue")
      .eq("organization_id", org.id)
      .order("period_start", { ascending: true }),
    loadRoadmap(supabase, org.id),
  ]);

  const chart = (metrics ?? []).map((m) => ({
    label: new Date(m.period_start).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
    revenue: m.revenue == null ? null : Number(m.revenue),
  }));

  const totalItems = roadmap.length;
  const doneItems = roadmap.filter((r) => r.status === "done").length;
  const roadmapPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  const nextSteps = roadmap
    .filter((r) => r.status !== "done" && r.status !== "skipped")
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-midnight">Bonjour 👋</h1>
        <p className="mt-1 text-sm text-slate-deep/80">
          Voici l'état de votre croissance — stade actuel {org.current_stage} vers {org.target_stage}.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Scalability Score</CardTitle>
          </CardHeader>
          {scoreData ? <ScoreGauge score={scoreData.result.total} /> : <div className="h-48" />}
          {scoreData && (
            <div className="mt-4 space-y-3 text-sm">
              <ScoreLine label="Financier" value={scoreData.result.financial} max={40} tone="midnight" />
              <ScoreLine
                label="Opérationnel"
                value={scoreData.result.operational}
                max={30}
                tone="emerald"
              />
              <ScoreLine label="Maturité" value={scoreData.result.maturity} max={30} tone="amber" />
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progression de la roadmap</CardTitle>
              <Badge tone={roadmapPct >= 66 ? "emerald" : roadmapPct >= 33 ? "amber" : "neutral"}>
                {roadmapPct}%
              </Badge>
            </CardHeader>
            <ProgressBar
              value={roadmapPct}
              tone={roadmapPct === 100 ? "emerald" : "midnight"}
              className="mb-4 h-3"
            />
            <p className="text-sm text-slate-deep/70">
              {doneItems} étape{doneItems > 1 ? "s" : ""} validée{doneItems > 1 ? "s" : ""} sur {totalItems}.
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chiffre d'affaires</CardTitle>
            </CardHeader>
            {chart.length > 0 ? (
              <RevenueChart data={chart} />
            ) : (
              <p className="py-8 text-center text-sm text-slate-deep/60">
                Les premières métriques apparaîtront ici dès leur saisie.
              </p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dernier CA</CardTitle>
          </CardHeader>
          <CardValue>
            {metrics && metrics.length > 0 && metrics[metrics.length - 1].revenue
              ? EUR.format(Number(metrics[metrics.length - 1].revenue))
              : "—"}
          </CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>LTV / CAC</CardTitle>
          </CardHeader>
          <CardValue>
            {scoreData?.result.details.ltvCacRatio != null
              ? `${scoreData.result.details.ltvCacRatio.toFixed(1)}×`
              : "—"}
          </CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Croissance YoY</CardTitle>
          </CardHeader>
          <CardValue>
            {scoreData?.result.details.revenueGrowthPct != null
              ? `${scoreData.result.details.revenueGrowthPct.toFixed(0)}%`
              : "—"}
          </CardValue>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prochaines étapes</CardTitle>
        </CardHeader>
        {nextSteps.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {nextSteps.map((step) => (
              <li key={step.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-midnight">{step.title}</p>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-slate-deep/70">{step.description}</p>
                  )}
                </div>
                <Badge tone="midnight">{step.stage}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-slate-deep/60">
            Toutes les étapes sont validées — bravo !
          </p>
        )}
        <div className="mt-4 flex justify-end">
          <a
            href="/dashboard/roadmap"
            className="inline-flex items-center gap-1 text-sm font-medium text-midnight hover:underline"
          >
            Voir la roadmap complète <ArrowRight className="h-4 w-4" />
          </a>
        </div>
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
