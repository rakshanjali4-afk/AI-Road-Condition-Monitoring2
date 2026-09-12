import { Zap, ScanLine, Cpu, Layers } from "lucide-react";
import HeroVisual from "./HeroVisual";

const STATS = [
  { icon: Cpu, label: "AI Model", value: "YOLO11n", color: "text-cyan-400" },
  { icon: Layers, label: "Detection Classes", value: "6 Classes", color: "text-emerald-400" },
  { icon: ScanLine, label: "Analysis Type", value: "AI Visual", color: "text-amber-400" },
];

export default function Hero() {
  return (
    <section className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-4 md:px-8 lg:px-16 overflow-hidden gradient-bg-hero">
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="container-max relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-blink" />
              <span className="text-[11px] md:text-xs font-mono font-semibold text-cyan-400 tracking-widest uppercase">
                AI-Powered Road Intelligence
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight text-balance animate-fade-in-up">
              Smarter Roads.
              <br />
              <span className="gradient-text">Safer Journeys.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base md:text-lg text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0 text-balance animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards", opacity: 0 }}>
              An intelligent computer-vision system that analyzes road images using a trained YOLO11n model to detect road-related conditions and visual objects.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards", opacity: 0 }}>
              <a href="/analyze" className="btn-primary inline-flex items-center justify-center gap-2 text-base">
                <Zap className="w-5 h-5" />
                Analyze a Road
              </a>
              <a href="/#how-it-works" className="btn-secondary inline-flex items-center justify-center gap-2 text-base">
                <ScanLine className="w-5 h-5" />
                How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-3 md:gap-6 max-w-lg mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards", opacity: 0 }}>
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-[10px] md:text-xs font-mono text-white/40 uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                  <div className={`text-base md:text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Visual */}
          <div className="relative animate-slide-in-right" style={{ animationDelay: "0.3s", animationFillMode: "forwards", opacity: 0 }}>
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent pointer-events-none" />
    </section>
  );
}
