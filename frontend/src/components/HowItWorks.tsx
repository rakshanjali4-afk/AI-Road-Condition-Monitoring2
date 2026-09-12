import { Upload, Cpu, FileBarChart, type LucideIcon } from "lucide-react";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Road Image",
    description:
      "Select or drag and drop a road image in JPG or PNG format. The image is securely sent to the Flask backend.",
    color: "text-cyan-400",
  },
  {
    number: "02",
    icon: Cpu,
    title: "YOLO11n AI Detection",
    description:
      "The trained YOLO11n model analyzes the image in real time, identifying road conditions and objects with bounding boxes and confidence scores.",
    color: "text-electric-400",
  },
  {
    number: "03",
    icon: FileBarChart,
    title: "Generate Road Analysis",
    description:
      "The system classifies the overall road condition and presents a detailed AI inspection report with detection statistics.",
    color: "text-emerald-400",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding relative">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <span className="text-[11px] font-mono font-semibold text-emerald-400 tracking-widest uppercase">
              Workflow
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto text-balance">
            Three simple steps from image upload to a complete AI-generated road condition report.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Connector line - desktop */}
          <div className="hidden md:block absolute top-24 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-cyan-400/30 via-electric-400/30 to-emerald-400/30">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 via-electric-400/50 to-emerald-400/50 animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
          </div>

          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.15}s`,
                animationFillMode: "forwards",
                opacity: 0,
              }}
            >
              {/* Number circle */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center relative z-10 group hover:scale-110 transition-transform duration-300">
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 blur-xl opacity-50`} />
                {/* Step number badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-navy-950 border border-white/20 flex items-center justify-center z-20">
                  <span className={`text-[10px] font-mono font-bold ${step.color}`}>
                    {step.number}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
