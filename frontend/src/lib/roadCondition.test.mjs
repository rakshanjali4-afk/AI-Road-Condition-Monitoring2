import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeCondition,
  computeRoadScore,
  evaluateRoadCondition,
  getConditionPresentation,
} from "./roadCondition.ts";

test("User Bug Scenario: Only LMVs detected", () => {
  const detections = [
    { name: "LMV", confidence: 88.5 },
    { name: "LMV", confidence: 91.0 },
  ];

  // Pure evaluation
  const result = evaluateRoadCondition(detections);
  assert.equal(result.condition, "ANALYSIS INCONCLUSIVE");
  assert.equal(result.score, null, "Score must not default to 100/100");

  // Score computation
  const score = computeRoadScore(detections, "ANALYSIS INCONCLUSIVE", null);
  assert.equal(score, null, "Score must be null when inconclusive");

  // Presentation check
  const pres = getConditionPresentation("ANALYSIS INCONCLUSIVE", score);
  assert.equal(pres.label, "Analysis Inconclusive");
  assert.equal(pres.badge, "ANALYSIS INCONCLUSIVE");
  assert.equal(pres.scoreText, "—/100");
  assert.notEqual(pres.label, "Excellent");
  assert.notEqual(pres.label, "Good");
});

test("Traffic classes (HMV, Pedestrian) do not count as safety evidence", () => {
  const detections = [
    { name: "HMV", confidence: 75.0 },
    { name: "Pedestrian", confidence: 80.0 },
  ];

  const result = evaluateRoadCondition(detections);
  assert.equal(result.condition, "ANALYSIS INCONCLUSIVE");
  assert.equal(result.score, null);
});

test("Empty detections array returns inconclusive", () => {
  const result = evaluateRoadCondition([]);
  assert.equal(result.condition, "ANALYSIS INCONCLUSIVE");
  assert.equal(result.score, null);
});

test("RoadDamages detected returns BAD and proper deduction", () => {
  const detections = [{ name: "RoadDamages", confidence: 85.0 }];
  const result = evaluateRoadCondition(detections);
  assert.equal(result.condition, "BAD");
  assert.equal(result.score, 80);

  const pres = getConditionPresentation(result.condition, result.score);
  assert.equal(pres.label, "Poor");
  assert.equal(pres.scoreText, "80/100");
});

test("Multiple RoadDamages detected reduces score further", () => {
  const detections = [
    { name: "RoadDamages", confidence: 85.0 },
    { name: "RoadDamages", confidence: 80.0 },
    { name: "RoadDamages", confidence: 75.0 },
  ];
  const result = evaluateRoadCondition(detections);
  assert.equal(result.condition, "BAD");
  assert.equal(result.score, 40);
});

test("UnsurfacedRoad detected returns BAD", () => {
  const detections = [{ name: "UnsurfacedRoad", confidence: 90.0 }];
  const result = evaluateRoadCondition(detections);
  assert.equal(result.condition, "BAD");
  assert.equal(result.score, 80);
});

test("SpeedBump alone returns MODERATE", () => {
  const detections = [{ name: "SpeedBump", confidence: 85.0 }];
  const result = evaluateRoadCondition(detections);
  assert.equal(result.condition, "MODERATE");
  assert.equal(result.score, 95);

  const pres = getConditionPresentation(result.condition, result.score);
  assert.equal(pres.label, "Moderate");
});

test("normalizeCondition never falls back to GOOD or MODERATE for unknown/inconclusive", () => {
  assert.equal(normalizeCondition("ANALYSIS INCONCLUSIVE"), "ANALYSIS INCONCLUSIVE");
  assert.equal(normalizeCondition("NEEDS REVIEW"), "NEEDS REVIEW");
  assert.equal(normalizeCondition("UNKNOWN"), "ANALYSIS INCONCLUSIVE");
  assert.equal(normalizeCondition(""), "ANALYSIS INCONCLUSIVE");
  assert.equal(normalizeCondition(null), "ANALYSIS INCONCLUSIVE");
  assert.equal(normalizeCondition("BAD"), "BAD");
  assert.equal(normalizeCondition("POOR"), "BAD");
  assert.equal(normalizeCondition("MODERATE"), "MODERATE");
});
