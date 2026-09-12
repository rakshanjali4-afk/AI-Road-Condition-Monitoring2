import {
  AlertTriangle,
  Gauge,
  Construction,
  Car,
  Truck,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";

interface Capability {
  icon: LucideIcon;
  name: string;
  description: string;
  color: string;
  bgColor: string;
}

const CAPABILITIES: Capability[] = [
  {
    icon: AlertTriangle,
    name: "Road Damage",
    description: "Detects road damage conditions visible in the image.",
    color: "text-danger-400",
    bgColor: "from-danger-500/20 to-danger-500/5",
  },
  {
    icon: Gauge,
    name: "Speed Bump",
    description: "Identifies speed bumps and related traffic-calming structures.",
    color: "text-amber-400",
    bgColor: "from-amber-500/20 to-amber-500/5",
  },
  {
    icon: Construction,
    name: "Unsurfaced Road",
    description: "Flags unsurfaced or unpaved road segments.",
    color: "text-amber-400",
    bgColor: "from-amber-500/20 to-amber-500/5",
  },
  {
    icon: Car,
    name: "LMV",
    description: "Detects Light Motor Vehicles in the road scene.",
    color: "text-cyan-400",
    bgColor: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    icon: Truck,
    name: "HMV",
    description: "Identifies Heavy Motor Vehicles present in the image.",
    color: "text-electric-400",
    bgColor: "from-electric-500/20 to-electric-500/5",
  },
  {
    icon: PersonStanding,
    name: "Pedestrian",
    description: "Detects pedestrians and people on or near the road.",
    color: "text-emerald-400",
    bgColor: "from-emerald-500/20 to-emerald-500/5",
  },
];

export default function Features() {
  return (
    <section id="features" className="section-padding relative">
      <div className="absolute inset-0 gradient-mesh" />

      <div className="container-max relative">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <span className="text-[11px] font-mono font-semibold text-cyan-400 tracking-widest uppercase">
              AI Capabilities
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance">
            What the Model Can <span className="gradient-text">Detect</span>
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto text-balance">
            The YOLO11n model is trained to recognize six road-related classes, enabling comprehensive visual road inspection.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap, index) => (
            <div
              key={cap.name}
              className="card-hover group relative overflow-hidden"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cap.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

              <div className="relative">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <cap.icon className={`w-6 h-6 ${cap.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  {cap.name}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
