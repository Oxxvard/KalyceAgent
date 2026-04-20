"use client";

import { useState } from "react";
import { ScoreRing, scoreColor, scoreLabel } from "@/components/ui/score-ring";
import { cn } from "@/lib/utils";

const AUDIT_SECTIONS = [
  {
    key: "strategy",
    label: "Stratégie & Vision",
    items: [
      "Clarté de la vision dirigeant",
      "Alignement équipe dirigeante",
      "Capacité d'arbitrage",
      "Horizon de planification",
    ],
  },
  {
    key: "ops",
    label: "Performance Opérationnelle",
    items: [
      "Maîtrise des coûts",
      "Efficacité des processus clés",
      "KPIs de pilotage",
      "Qualité d'exécution",
    ],
  },
  {
    key: "rh",
    label: "Capital Humain",
    items: [
      "Compétences clés disponibles",
      "Rétention des talents",
      "Culture d'entreprise",
      "Plan de succession",
    ],
  },
  {
    key: "finance",
    label: "Solidité Financière",
    items: [
      "Structure du bilan",
      "Trésorerie & BFR",
      "Rentabilité opérationnelle",
      "Accès aux financements",
    ],
  },
  {
    key: "market",
    label: "Position Marché",
    items: [
      "Part de marché",
      "Différenciation concurrentielle",
      "Satisfaction clients",
      "Pipeline commercial",
    ],
  },
];

const AUDIT_TYPES = [
  "Audit stratégique complet",
  "Performance opérationnelle",
  "Préparation M&A",
  "Audit organisationnel",
];

export function AuditWizard({
  organizations,
}: {
  organizations: { id: string; name: string }[];
}) {
  const [step, setStep] = useState(0);
  const [clientName, setClientName] = useState(organizations[0]?.name ?? "");
  const [auditType, setAuditType] = useState(AUDIT_TYPES[0]);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(AUDIT_SECTIONS.map((s) => [s.key, 70])),
  );
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const global = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / AUDIT_SECTIONS.length,
  );

  const generate = async () => {
    setLoading(true);
    setStep(2);
    // Stub: build a synthetic report (real app would call /api/audit)
    await new Promise((r) => setTimeout(r, 1200));
    const lines = [
      `**Synthèse** — ${clientName} présente un score global de ${global}/100 (${scoreLabel(global)}). La mission ${auditType.toLowerCase()} révèle des axes de travail prioritaires sur ${AUDIT_SECTIONS.filter((s) => scores[s.key] < 65).map((s) => s.label.split(" ")[0]).join(", ") || "l'ensemble des dimensions"}.`,
      `**Points forts** — ${AUDIT_SECTIONS.filter((s) => scores[s.key] >= 75).map((s) => s.label).join(" · ") || "Aucun seuil dépassé — montée en puissance à consolider."}`,
      `**Axes prioritaires** — Concentrer les 90 premiers jours sur ${AUDIT_SECTIONS.sort((a, b) => scores[a.key] - scores[b.key]).slice(0, 2).map((s) => s.label).join(" et ")}, en structurant un plan d'action trimestriel validé en COMEX.`,
    ];
    setReport(lines.join("\n\n"));
    setLoading(false);
  };

  const stepLabels = ["Paramètres", "Évaluation", "Rapport"];

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step + 1 && setStep(i)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-all",
                step === i
                  ? "border-gold bg-gold text-ink"
                  : i < step
                  ? "border-success bg-success text-ink"
                  : "border-line bg-surface text-muted",
              )}
            >
              {i < step ? "✓" : i + 1}
            </button>
            <span className={cn("text-[12px]", step === i ? "text-white" : "text-muted")}>
              {label}
            </span>
            {i < 2 && <div className="w-6 h-px bg-line" />}
          </div>
        ))}
      </div>

      {/* Step 0: Params */}
      {step === 0 && (
        <div className="max-w-xl space-y-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
              Client à auditer
            </label>
            <select
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink-soft px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-gold/60"
            >
              {organizations.length > 0 ? (
                organizations.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))
              ) : (
                <option>Aucun client — créez-en un d'abord</option>
              )}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
              Type d&apos;audit
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {AUDIT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setAuditType(t)}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left text-[13px] transition-all",
                    auditType === t
                      ? "border-gold/60 bg-gold/15 text-white"
                      : "border-line bg-surface text-textL hover:bg-surface-hover",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="rounded-lg bg-gold px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-gold-soft"
          >
            Commencer l&apos;évaluation →
          </button>
        </div>
      )}

      {/* Step 1: Sliders */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Global score banner */}
          <div className="flex items-center justify-between rounded-xl border border-gold/30 bg-score-aura px-6 py-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-gold">
                Score global actuel
              </div>
              <div className="mt-1 text-[36px] font-bold leading-none text-white">
                {global}
                <span className="text-[16px] font-normal text-muted">/100</span>
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-[14px] font-semibold"
                style={{ color: scoreColor(global) }}
              >
                {scoreLabel(global)}
              </div>
              <div className="text-[11px] text-muted">{clientName}</div>
            </div>
          </div>

          {AUDIT_SECTIONS.map((s) => (
            <div key={s.key} className="rounded-xl border border-line bg-surface px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[14px] font-semibold text-white">{s.label}</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={scores[s.key]}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [s.key]: +e.target.value }))
                    }
                    className="w-28"
                  />
                  <span
                    className="w-10 text-right text-[18px] font-bold"
                    style={{ color: scoreColor(scores[s.key]) }}
                  >
                    {scores[s.key]}
                  </span>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <span
                    key={item}
                    className="rounded border border-line bg-white/5 px-2.5 py-1 text-[11px] text-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div
                className="h-1 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-200"
                  style={{
                    width: `${scores[s.key]}%`,
                    background: scoreColor(scores[s.key]),
                  }}
                />
              </div>
            </div>
          ))}

          <button
            onClick={generate}
            className="rounded-xl bg-gold px-6 py-3.5 text-[14px] font-bold text-ink hover:bg-gold-soft"
          >
            ✦ Générer le rapport IA →
          </button>
        </div>
      )}

      {/* Step 2: Report */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Score mini-rings */}
          <div className="flex gap-3 flex-wrap">
            {AUDIT_SECTIONS.map((s) => (
              <div
                key={s.key}
                className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-line bg-surface px-4 py-4 min-w-[100px]"
              >
                <ScoreRing score={scores[s.key]} size={56} />
                <div className="text-center text-[10px] text-muted leading-snug">
                  {s.label.split(" ")[0]}
                </div>
              </div>
            ))}
          </div>

          {/* AI report */}
          <div className="rounded-xl border border-line bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-[18px] font-bold text-white">
                Synthèse Exécutive — {clientName}
              </span>
              <span className="rounded border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-gold">
                IA Génératif
              </span>
            </div>
            {loading ? (
              <p className="py-6 text-[13px] italic text-muted">
                ✦ Génération de l&apos;analyse stratégique en cours…
              </p>
            ) : (
              <p className="whitespace-pre-wrap text-[13px] leading-[1.8] text-textL">
                {report}
              </p>
            )}
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px] text-textL hover:bg-surface-hover"
            >
              ← Modifier les scores
            </button>
            <button className="rounded-lg bg-gold px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-gold-soft">
              ⬇ Exporter PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
