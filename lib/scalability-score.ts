export type Stage = "local" | "national" | "international";

export type ScoreMetrics = {
  revenue?: number;
  cac?: number;
  ltv?: number;
  fte?: number;
  grossMarginPct?: number;
};

export type ChecklistItem = {
  stage: Stage;
  weight: number;
  done: boolean;
};

export type ScoreInput = {
  metrics: ScoreMetrics;
  previousRevenue?: number;
  checklist: ChecklistItem[];
  currentStage: Stage;
  targetStage: Stage;
};

export type ScoreBreakdown = {
  financial: number;
  operational: number;
  maturity: number;
  total: number;
  details: {
    ltvCacRatio: number | null;
    revenueGrowthPct: number | null;
    grossMarginPct: number | null;
    revenuePerFte: number | null;
    currentStageCompletionPct: number;
    maturityCompletionPct: number;
  };
};

const STAGE_ORDER: Record<Stage, number> = {
  local: 0,
  national: 1,
  international: 2,
};

const MAX = {
  ltvCac: 15,
  revenueGrowth: 15,
  grossMargin: 10,
  revenuePerFte: 15,
  currentStageChecklist: 15,
  maturity: 30,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scoreLtvCac(ltv?: number, cac?: number): { points: number; ratio: number | null } {
  if (!ltv || !cac || cac <= 0) return { points: 0, ratio: null };
  const ratio = ltv / cac;
  // 1:1 = 0pt, 3:1 (référence SaaS) = full marks, plafonné au-delà.
  const points = clamp(((ratio - 1) / 2) * MAX.ltvCac, 0, MAX.ltvCac);
  return { points, ratio };
}

function scoreRevenueGrowth(
  revenue?: number,
  previous?: number,
): { points: number; growthPct: number | null } {
  if (!revenue || !previous || previous <= 0) return { points: 0, growthPct: null };
  const growthPct = ((revenue - previous) / previous) * 100;
  // 0% = 0pt, 50% YoY = full marks.
  const points = clamp((growthPct / 50) * MAX.revenueGrowth, 0, MAX.revenueGrowth);
  return { points, growthPct };
}

function scoreGrossMargin(grossMarginPct?: number): { points: number; pct: number | null } {
  if (grossMarginPct == null) return { points: 0, pct: null };
  // 0% = 0pt, 60% = full marks.
  const points = clamp((grossMarginPct / 60) * MAX.grossMargin, 0, MAX.grossMargin);
  return { points, pct: grossMarginPct };
}

function scoreRevenuePerFte(
  revenue?: number,
  fte?: number,
): { points: number; perFte: number | null } {
  if (!revenue || !fte || fte <= 0) return { points: 0, perFte: null };
  const perFte = revenue / fte;
  // 100k€/ETP = full marks (réf. PME services).
  const points = clamp((perFte / 100_000) * MAX.revenuePerFte, 0, MAX.revenuePerFte);
  return { points, perFte };
}

function scoreCurrentStageChecklist(
  checklist: ChecklistItem[],
  currentStage: Stage,
): { points: number; completionPct: number } {
  const items = checklist.filter((c) => c.stage === currentStage);
  const totalWeight = items.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return { points: 0, completionPct: 0 };
  const doneWeight = items.filter((c) => c.done).reduce((sum, c) => sum + c.weight, 0);
  const completionPct = (doneWeight / totalWeight) * 100;
  const points = (doneWeight / totalWeight) * MAX.currentStageChecklist;
  return { points, completionPct };
}

function scoreMaturity(
  checklist: ChecklistItem[],
  currentStage: Stage,
  targetStage: Stage,
): { points: number; completionPct: number } {
  const targetIdx = STAGE_ORDER[targetStage];
  const currentIdx = STAGE_ORDER[currentStage];
  const startIdx = Math.min(currentIdx, targetIdx);
  const endIdx = Math.max(currentIdx, targetIdx);

  const inScope = checklist.filter((c) => {
    const idx = STAGE_ORDER[c.stage];
    return idx >= startIdx && idx <= endIdx;
  });

  const totalWeight = inScope.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return { points: 0, completionPct: 0 };
  const doneWeight = inScope.filter((c) => c.done).reduce((sum, c) => sum + c.weight, 0);
  const completionPct = (doneWeight / totalWeight) * 100;
  const points = (doneWeight / totalWeight) * MAX.maturity;
  return { points, completionPct };
}

export function computeScalabilityScore(input: ScoreInput): ScoreBreakdown {
  const ltvCac = scoreLtvCac(input.metrics.ltv, input.metrics.cac);
  const growth = scoreRevenueGrowth(input.metrics.revenue, input.previousRevenue);
  const margin = scoreGrossMargin(input.metrics.grossMarginPct);
  const perFte = scoreRevenuePerFte(input.metrics.revenue, input.metrics.fte);
  const stageChk = scoreCurrentStageChecklist(input.checklist, input.currentStage);
  const maturity = scoreMaturity(input.checklist, input.currentStage, input.targetStage);

  const financial = ltvCac.points + growth.points + margin.points;
  const operational = perFte.points + stageChk.points;
  const total = Math.round(financial + operational + maturity.points);

  return {
    financial: Math.round(financial),
    operational: Math.round(operational),
    maturity: Math.round(maturity.points),
    total: clamp(total, 0, 100),
    details: {
      ltvCacRatio: ltvCac.ratio,
      revenueGrowthPct: growth.growthPct,
      grossMarginPct: margin.pct,
      revenuePerFte: perFte.perFte,
      currentStageCompletionPct: Math.round(stageChk.completionPct),
      maturityCompletionPct: Math.round(maturity.completionPct),
    },
  };
}
