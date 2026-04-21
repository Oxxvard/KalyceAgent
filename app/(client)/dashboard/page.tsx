import Link from "next/link";
import { redirect } from "next/navigation";

import { ProgressBar } from "@/components/ui/progress";
import { ScoreRing, scoreColor, scoreLabel } from "@/components/ui/score-ring";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { createClient } from "@/lib/supabase/server";
import { computeForOrg } from "@/lib/score-data";
import { loadRoadmap } from "@/lib/roadmap-data";

const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const STAGE_LABEL: Record<string, string> = {
  local: "Local",
  national: "National",
  international: "International",
};

const DIMENSION_LABELS = [
  { key: "financial", label: "Financier", max: 40 },
  { key: "operational", label: "Opérationnel", max: 30 },
  { key: "maturity", label: "Maturité", max: 30 },
];

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="font-display text-[22px] font-semibold text-white">
          Compte prêt — en attente de rattachement
        </h1>
        <p className="mt-3 text-[13px] text-muted">
          Votre consultant Kalyce n&apos;a pas encore associé votre compte à une
          organisation. Vous recevrez une notification dès que ce sera fait.
        </p>
        <p className="mt-6 text-[11px] text-muted">
          Contact : <span className="text-gold">contact@kalyce.consulting</span>
        </p>
      </div>
    );
  }

  // Charger l'organisation avec une requête séparée
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, current_stage, target_stage, consultant_id")
    .eq("id", profile.organization_id)
    .maybeSingle();

  if (!org) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="font-display text-[22px] font-semibold text-white">
          Erreur
        </h1>
        <p className="mt-3 text-[13px] text-muted">
          Organisation introuvable.
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
    label: new Date(m.period_start).toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    }),
    revenue: m.revenue == null ? null : Number(m.revenue),
  }));

  const totalItems = roadmap.length;
  const doneItems = roadmap.filter((r) => r.status === "done").length;
  const roadmapPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  const nextSteps = roadmap
    .filter((r) => r.status !== "done" && r.status !== "skipped")
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);

  const total = scoreData?.result.total ?? 0;
  const lastRevenue = metrics?.at(-1)?.revenue
    ? Number(metrics.at(-1)!.revenue)
    : null;

  const { data: consultantProfile } = org.consultant_id
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", org.consultant_id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">
            Votre tableau de bord
          </div>
          <h1 className="font-display text-[28px] font-bold text-white">{org.name}</h1>
          <p className="mt-1 text-[13px] text-muted">
            Mission {STAGE_LABEL[org.current_stage] ?? org.current_stage} →{" "}
            {STAGE_LABEL[org.target_stage] ?? org.target_stage} ·{" "}
            {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </p>
        </div>
        {consultantProfile?.full_name && (
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-muted mb-1">Votre consultant</div>
            <div className="text-[14px] font-semibold text-white">
              {consultantProfile.full_name}
            </div>
            <div className="text-[11px] text-gold mt-1">Kalyce Consulting</div>
          </div>
        )}
      </div>

      {/* Score aura banner */}
      {scoreData && (
        <div className="flex gap-6 items-center rounded-2xl border border-gold/30 bg-score-aura px-7 py-5">
          <ScoreRing score={total} size={84} />
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-gold">
              Score de croissance global
            </div>
            <div className="mt-1 text-[22px] font-bold text-white">
              {scoreLabel(total)}{" "}
              <span className="text-[14px] font-normal text-muted">— {total}/100</span>
            </div>
            <div className="mt-1 text-[12px] text-textL">
              Objectif : 85 · Progression en cours
            </div>
          </div>
          <div className="ml-auto hidden md:block rounded-xl bg-surface px-5 py-3 text-center">
            <div
              className="text-[28px] font-bold text-gold"
              style={{ color: roadmapPct >= 75 ? "#6ee7b7" : undefined }}
            >
              {roadmapPct}%
            </div>
            <div className="text-[11px] text-muted mt-1">Roadmap complétée</div>
          </div>
        </div>
      )}

      {/* Dimensions + Revenue */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {scoreData && (
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="mb-4 text-[14px] font-semibold text-white">Scores par dimension</div>
            <div className="space-y-4">
              {DIMENSION_LABELS.map(({ key, label, max }) => {
                const raw = scoreData.result[key as keyof typeof scoreData.result] as number;
                const pct = Math.round((raw / max) * 100);
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-36 shrink-0 text-[12px] text-textL">{label}</div>
                    <div
                      className="flex-1 h-1.5 overflow-hidden rounded-full"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${pct}%`, background: scoreColor(pct) }}
                      />
                    </div>
                    <div
                      className="w-10 text-right text-[12px] font-semibold"
                      style={{ color: scoreColor(pct) }}
                    >
                      {raw}/{max}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="mb-1 text-[14px] font-semibold text-white">Chiffre d&apos;affaires</div>
          {chart.length > 0 ? (
            <RevenueChart data={chart} />
          ) : (
            <p className="py-16 text-center text-[13px] text-muted">
              Les métriques apparaîtront ici dès leur saisie.
            </p>
          )}
        </div>
      </div>

      {/* KPI mini-row */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Dernier CA",
            value: lastRevenue ? EUR.format(lastRevenue) : "—",
          },
          {
            label: "LTV / CAC",
            value:
              scoreData?.result.details.ltvCacRatio != null
                ? `${scoreData.result.details.ltvCacRatio.toFixed(1)}×`
                : "—",
          },
          {
            label: "Croissance YoY",
            value:
              scoreData?.result.details.revenueGrowthPct != null
                ? `${scoreData.result.details.revenueGrowthPct.toFixed(0)}%`
                : "—",
          },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-line bg-surface px-5 py-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">
              {k.label}
            </div>
            <div className="text-[22px] font-semibold text-white">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <span className="text-[14px] font-semibold text-white">Vos prochaines étapes</span>
        </div>
        {nextSteps.length > 0 ? (
          <ul>
            {nextSteps.map((step) => {
              const isActive = step.status === "in_progress";
              return (
                <li
                  key={step.id}
                  className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-b-0 transition-colors hover:bg-surface-raised"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] ${
                      isActive ? "bg-gold/20 text-gold" : "bg-white/6 text-muted"
                    }`}
                  >
                    {isActive ? "▶" : "○"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] ${isActive ? "font-semibold text-white" : "text-textL"}`}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="mt-0.5 text-[11px] text-muted truncate">{step.description}</p>
                    )}
                  </div>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${
                      isActive
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-line bg-surface text-muted"
                    }`}
                  >
                    {isActive ? "En cours" : "À venir"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-10 text-center text-[13px] text-success">
            Toutes les étapes sont validées — félicitations !
          </p>
        )}
        <div className="flex justify-end border-t border-line px-5 py-3">
          <Link
            href="/dashboard/roadmap"
            className="text-[12px] font-medium text-gold hover:text-gold-soft"
          >
            Voir la roadmap complète →
          </Link>
        </div>
      </div>
    </div>
  );
}
