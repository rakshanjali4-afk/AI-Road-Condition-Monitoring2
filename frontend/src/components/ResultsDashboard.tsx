import { FileBarChart, RotateCcw } from "lucide-react";
import type { PredictResponse } from "@/lib/api";
import { normalizeCondition, countDetections, buildImageUrl } from "@/lib/api";
import ConditionCard from "./ConditionCard";
import ResultStats from "./ResultStats";
import DetectedImage from "./DetectedImage";
import DetectionDetails from "./DetectionDetails";

interface ResultsDashboardProps {
  result: PredictResponse;
  onReset: () => void;
}

export default function ResultsDashboard({
  result,
  onReset,
}: ResultsDashboardProps) {
  const condition = normalizeCondition(result.condition);
  const counts = countDetections(result.detections);
  const imageUrl = buildImageUrl(result.image_url);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center">
            <FileBarChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-cyan-400 tracking-widest uppercase">
              AI Inspection Report
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Road Analysis Result
            </h2>
          </div>
        </div>

        <button
          onClick={onReset}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      {/* Condition card */}
      <ConditionCard condition={condition} />

      {/* Statistics */}
      <ResultStats
        roadDamage={counts.roadDamage}
        speedBump={counts.speedBump}
        unsurfacedRoad={counts.unsurfacedRoad}
        total={counts.total}
      />

      {/* Detected image + Detection details */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DetectedImage imageUrl={imageUrl} />
        </div>
        <div className="lg:col-span-2">
          <DetectionDetails detections={result.detections} />
        </div>
      </div>
    </div>
  );
}
