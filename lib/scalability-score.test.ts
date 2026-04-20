import { test } from "node:test";
import assert from "node:assert/strict";

import { computeScalabilityScore } from "./scalability-score";

test("retourne 0 quand aucune donnée n'est fournie", () => {
  const result = computeScalabilityScore({
    metrics: {},
    checklist: [],
    currentStage: "local",
    targetStage: "national",
  });
  assert.equal(result.total, 0);
  assert.equal(result.financial, 0);
  assert.equal(result.operational, 0);
  assert.equal(result.maturity, 0);
});

test("PME locale solide vise un score significatif", () => {
  const result = computeScalabilityScore({
    metrics: {
      revenue: 500_000,
      cac: 200,
      ltv: 600,
      fte: 5,
      grossMarginPct: 55,
    },
    previousRevenue: 350_000,
    checklist: [
      { stage: "local", weight: 2, done: true },
      { stage: "local", weight: 2, done: true },
      { stage: "local", weight: 1, done: false },
      { stage: "national", weight: 2, done: false },
    ],
    currentStage: "local",
    targetStage: "national",
  });
  assert.ok(result.total >= 50, `score attendu >= 50, reçu ${result.total}`);
  assert.ok(result.total <= 100);
  assert.ok(result.details.ltvCacRatio !== null);
});

test("borne le score à 100 même avec des inputs très favorables", () => {
  const result = computeScalabilityScore({
    metrics: {
      revenue: 5_000_000,
      cac: 100,
      ltv: 5_000,
      fte: 10,
      grossMarginPct: 90,
    },
    previousRevenue: 1_000_000,
    checklist: [
      { stage: "local", weight: 1, done: true },
      { stage: "national", weight: 1, done: true },
      { stage: "international", weight: 1, done: true },
    ],
    currentStage: "national",
    targetStage: "international",
  });
  assert.equal(result.total, 100);
});
