export type ConditionLevel =
  | "GOOD"
  | "MODERATE"
  | "BAD"
  | "NEEDS REVIEW"
  | "ANALYSIS INCONCLUSIVE";

export interface Detection {
  name: string;
  confidence: number;
}

/**
 * Normalizes condition strings from API or legacy fallbacks.
 * Inconclusive or unknown conditions NEVER default to GOOD or MODERATE.
 */
export function normalizeCondition(condition?: string | null): ConditionLevel {
  const upper = (condition || "").toUpperCase().trim();
  if (upper === "BAD" || upper === "POOR" || upper === "UNSAFE") return "BAD";
  if (upper === "MODERATE" || upper === "CAUTION") return "MODERATE";
  if (upper === "GOOD" || upper === "EXCELLENT") return "GOOD";
  if (upper.includes("REVIEW")) return "NEEDS REVIEW";
  if (upper.includes("INCONCLUSIVE") || upper === "") return "ANALYSIS INCONCLUSIVE";
  return "ANALYSIS INCONCLUSIVE";
}

/**
 * Computes road condition score safely.
 * Returns null (rendered as —/100) when there is no road surface evidence,
 * or when condition is inconclusive. Detections of vehicles (LMV/HMV) or
 * pedestrians do not count as evidence of a good road.
 */
export function computeRoadScore(
  detections: Detection[] = [],
  condition?: string | null,
  explicitScore?: number | null
): number | null {
  if (explicitScore !== undefined && explicitScore !== null) {
    return explicitScore;
  }

  const safeDetections = Array.isArray(detections) ? detections : [];
  const roadDamage = safeDetections.filter((d) => d?.name === "RoadDamages").length;
  const unsurfaced = safeDetections.filter((d) => d?.name === "UnsurfacedRoad").length;
  const speedBump = safeDetections.filter((d) => d?.name === "SpeedBump").length;

  const hasRoadEvidence = roadDamage > 0 || unsurfaced > 0 || speedBump > 0;
  const isExplicitlyGood = (condition || "").toUpperCase().trim() === "GOOD";

  if (!hasRoadEvidence && !isExplicitlyGood) {
    return null;
  }

  let score = 100;
  score -= roadDamage * 20;
  score -= unsurfaced * 20;
  score -= speedBump * 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Pure evaluation function mirroring backend logic.
 */
export function evaluateRoadCondition(detections: Detection[] = []): {
  condition: "BAD" | "MODERATE" | "ANALYSIS INCONCLUSIVE";
  score: number | null;
} {
  const safeDetections = Array.isArray(detections) ? detections : [];
  const roadDamage = safeDetections.filter((d) => d?.name === "RoadDamages").length;
  const unsurfaced = safeDetections.filter((d) => d?.name === "UnsurfacedRoad").length;
  const speedBump = safeDetections.filter((d) => d?.name === "SpeedBump").length;

  if (roadDamage > 0 || unsurfaced > 0) {
    const score = Math.max(
      0,
      Math.min(100, 100 - roadDamage * 20 - unsurfaced * 20 - speedBump * 5)
    );
    return { condition: "BAD", score };
  }

  if (speedBump > 0) {
    const score = Math.max(0, Math.min(100, 100 - speedBump * 5));
    return { condition: "MODERATE", score };
  }

  return { condition: "ANALYSIS INCONCLUSIVE", score: null };
}

/**
 * Returns consistent UI styling and text tokens for condition presentation.
 */
export function getConditionPresentation(
  condition?: string | null,
  score?: number | null
) {
  const normalized = normalizeCondition(condition);

  switch (normalized) {
    case "BAD":
      return {
        label: "Poor",
        badge: "BAD",
        colorClass: "text-red-400",
        bgClass: "bg-red-500/10 border-red-500/20",
        accentHex: "#ef4444",
        icon: "⚠️",
        scoreText:
          score !== null && score !== undefined ? `${score}/100` : "—/100",
      };
    case "MODERATE":
      return {
        label: "Moderate",
        badge: "MODERATE",
        colorClass: "text-yellow-400",
        bgClass: "bg-yellow-500/10 border-yellow-500/20",
        accentHex: "#f59e0b",
        icon: "🚧",
        scoreText:
          score !== null && score !== undefined ? `${score}/100` : "—/100",
      };
    case "GOOD":
      return {
        label: "Good",
        badge: "GOOD",
        colorClass: "text-emerald-400",
        bgClass: "bg-emerald-500/10 border-emerald-500/20",
        accentHex: "#00e5b0",
        icon: "✓",
        scoreText:
          score !== null && score !== undefined ? `${score}/100` : "100/100",
      };
    case "NEEDS REVIEW":
      return {
        label: "Needs Review",
        badge: "NEEDS REVIEW",
        colorClass: "text-amber-400",
        bgClass: "bg-amber-500/10 border-amber-500/20",
        accentHex: "#f59e0b",
        icon: "ℹ️",
        scoreText: "—/100",
      };
    case "ANALYSIS INCONCLUSIVE":
    default:
      return {
  label: "Insufficient Road Evidence",
  badge: "ANALYSIS INCONCLUSIVE",
  colorClass: "text-amber-400",
  bgClass: "bg-amber-500/10 border-amber-500/20",
  accentHex: "#f59e0b",
  icon: "ℹ️",
  scoreText: "—/100",
  message:
    "The AI could not identify sufficient road-surface evidence. Please upload another clear road image.",
};
  }
}
