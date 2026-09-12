import { Link } from "react-router-dom";
import {
  Radar,
  ScanLine,
  Activity,
  Cpu,
} from "lucide-react";

function BoundingBox({
  className,
  label,
  confidence,
  color,
  delay,
}: {
  className: string;
  label: string;
  confidence: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className={`absolute border-2 ${color} rounded-sm animate-fade-in opacity-0 ${className}`}
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      <div
        className={`absolute -top-6 left-0 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-sm whitespace-nowrap ${color.replace("border", "bg").replace("/70", "/90")} text-navy-950`}
      >
        {label} {confidence}
      </div>
      <div className={`absolute inset-0 ${color.replace("border", "bg").replace("/70", "/10")} rounded-sm`} />
    </div>
  );
}

export default function HeroVisual() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-electric-600/20 via-cyan-500/10 to-emerald-500/10 blur-3xl animate-glow" />

      {/* Main container */}
      <div className="relative glass rounded-3xl overflow-hidden h-full grid-bg">
        {/* Top status bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-navy-950/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-blink" />
            <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-wider">
              SYSTEM ONLINE
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
              YOLO11n
            </span>
          </div>
        </div>

        {/* Scene preview area */}
        <div className="absolute inset-0 pt-12 pb-16 px-4">
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 overflow-hidden border border-white/5">
            {/* Simulated road scene */}
            <div className="absolute inset-0">
              {/* Sky */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-navy-700/40 to-transparent" />
              {/* Road */}
              <div
                className="absolute bottom-0 left-0 right-0 h-2/3"
                style={{
                  background:
                    "linear-gradient(to top, #1a2845 0%, #0f1e3d 100%)",
                  clipPath: "polygon(0% 100%, 100% 100%, 70% 0%, 30% 0%)",
                }}
              />
              {/* Road lines */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-full flex flex-col gap-3 items-center pt-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-cyan-400/30 rounded-full"
                    style={{ height: `${8 + i * 3}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Bounding boxes */}
            <BoundingBox
              className="top-[20%] left-[15%] w-[30%] h-[25%]"
              label="LMV"
              confidence="58%"
              color="border-cyan-400/70"
              delay="0.5s"
            />
            <BoundingBox
              className="top-[45%] right-[12%] w-[25%] h-[20%]"
              label="HMV"
              confidence="35%"
              color="border-amber-400/70"
              delay="1s"
            />
            <BoundingBox
              className="bottom-[18%] left-[28%] w-[22%] h-[16%]"
              label="Pedestrian"
              confidence="72%"
              color="border-emerald-400/70"
              delay="1.5s"
            />

            {/* Scanning line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-md" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-md" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-md" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400/50 rounded-br-md" />
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-around px-4 py-3 bg-navy-950/80 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[9px] font-mono text-white/70">SCANNING</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-mono text-white/70">DETECTING</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] font-mono text-white/70">98% ACC</span>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute top-1/4 -right-3 glass rounded-lg px-3 py-2 animate-float" style={{ animationDelay: "0s" }}>
          <div className="text-[9px] font-mono text-white/50">CONFIDENCE</div>
          <div className="text-sm font-bold text-cyan-400">58.39%</div>
        </div>
        <div className="absolute bottom-1/3 -left-3 glass rounded-lg px-3 py-2 animate-float" style={{ animationDelay: "2s" }}>
          <div className="text-[9px] font-mono text-white/50">CLASSES</div>
          <div className="text-sm font-bold text-emerald-400">6 Active</div>
        </div>
      </div>

      {/* Pulse rings */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-2 border-cyan-400/20 animate-pulse-ring" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full border-2 border-emerald-400/20 animate-pulse-ring" style={{ animationDelay: "1s" }} />
    </div>
  );
}
