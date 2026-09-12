import { Upload, ScanLine, Cpu, FileCheck2, type LucideIcon } from "lucide-react";

interface ScanStep {
  icon: LucideIcon;
  label: string;
}

const STEPS: ScanStep[] = [
  { icon: Upload, label: "Uploading image" },
  { icon: ScanLine, label: "Analyzing road scene" },
  { icon: Cpu, label: "Running YOLO detection" },
  { icon: FileCheck2, label: "Generating inspection result" },
];

interface LoadingStateProps {
  currentPhase: number;
}

export default function LoadingState({ currentPhase }: LoadingStateProps) {
  return (
    <div className="card relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-electric-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/40 animate-pulse-ring" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Analysis In Progress</h2>
            <p className="text-xs text-cyan-400 font-mono">PROCESSING...</p>
          </div>
        </div>

        {/* Scanning visualization */}
        <div className="relative h-48 rounded-2xl bg-navy-950 border border-white/10 overflow-hidden mb-6">
          {/* Grid background */}
          <div className="absolute inset-0 grid-bg opacity-40" />

          {/* Scanning line */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line shadow-[0_0_20px_rgba(34,211,238,0.8)]" />

          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400/40 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400/40 rounded-br-lg" />

          {/* Center status */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-cyan-400 tabular-nums">
                {Math.min(currentPhase * 25, 100)}%
              </div>
              <div className="text-xs font-mono text-white/40 mt-1 tracking-wider">
                YOLO11n INFERENCE
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const isActive = index === currentPhase;
            const isDone = index < currentPhase;
            const isPending = index > currentPhase;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "glass border-cyan-400/30"
                    : isDone
                    ? "bg-emerald-500/5 border border-emerald-500/10"
                    : "bg-white/[0.02] border border-white/5"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isActive
                      ? "bg-cyan-500/20"
                      : isDone
                      ? "bg-emerald-500/20"
                      : "bg-white/5"
                  }`}
                >
                  {isDone ? (
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <step.icon
                      className={`w-4 h-4 ${
                        isActive ? "text-cyan-400" : "text-white/30"
                      } ${isActive ? "animate-pulse" : ""}`}
                    />
                  )}
                </div>

                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-cyan-400"
                      : isDone
                      ? "text-emerald-400"
                      : "text-white/30"
                  }`}
                >
                  {step.label}
                </span>

                {isActive && (
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-blink"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}

                {isDone && (
                  <span className="ml-auto text-xs font-mono text-emerald-400">
                    DONE
                  </span>
                )}

                {isPending && (
                  <span className="ml-auto text-xs font-mono text-white/20">
                    PENDING
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
