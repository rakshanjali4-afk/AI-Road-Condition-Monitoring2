import { ListChecks } from "lucide-react";
import type { Detection } from "@/lib/api";

const CLASS_COLORS: Record<string, string> = {
  RoadDamages: "bg-danger-500",
  SpeedBump: "bg-amber-500",
  UnsurfacedRoad: "bg-amber-500",
  LMV: "bg-cyan-500",
  HMV: "bg-electric-500",
  Pedestrian: "bg-emerald-500",
};

function getBarColor(name: string): string {
  return CLASS_COLORS[name] || "bg-cyan-500";
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return "text-emerald-400";
  if (confidence >= 40) return "text-amber-400";
  return "text-danger-400";
}

interface DetectionRowProps {
  detection: Detection;
  index: number;
}

function DetectionRow({ detection, index }: DetectionRowProps) {
  const barColor = getBarColor(detection.name);
  const confColor = getConfidenceColor(detection.confidence);
  const barWidth = Math.min(detection.confidence, 100);

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl glass hover:bg-white/5 transition-all duration-200 animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.08}s`,
        animationFillMode: "forwards",
        opacity: 0,
      }}
    >
      {/* Index */}
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-mono font-bold text-white/40">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Class name */}
      <div className="w-28 md:w-36 flex-shrink-0">
        <span className="text-sm font-semibold text-white">
          {detection.name}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="flex-1 min-w-0">
        <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`absolute left-0 top-0 bottom-0 ${barColor} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Confidence value */}
      <div className={`text-sm font-mono font-bold ${confColor} tabular-nums flex-shrink-0 w-20 text-right`}>
        {detection.confidence.toFixed(2)}%
      </div>
    </div>
  );
}

interface DetectionDetailsProps {
  detections: Detection[];
}

export default function DetectionDetails({ detections }: DetectionDetailsProps) {
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="card">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center">
          <ListChecks className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Detection Details</h3>
          <p className="text-[11px] font-mono text-white/40 tracking-wider">
            {detections.length} {detections.length === 1 ? "OBJECT" : "OBJECTS"} DETECTED
          </p>
        </div>
      </div>

      {detections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-white/40">
            No objects detected in this image.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((detection, index) => (
            <DetectionRow
              key={`${detection.name}-${index}`}
              detection={detection}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
