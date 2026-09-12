import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ConditionLevel } from "@/lib/api";

interface ConditionConfig {
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  glow: string;
}

const CONDITIONS: Record<ConditionLevel, ConditionConfig> = {
  GOOD: {
    label: "GOOD",
    description: "No monitored road-problem class was detected in the image.",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-emerald-600",
    iconColor: "text-emerald-400",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  MODERATE: {
    label: "MODERATE",
    description: "A monitored road condition was detected in the image.",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-amber-600",
    iconColor: "text-amber-400",
    textColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glow: "shadow-amber-500/20",
  },
  BAD: {
    label: "BAD",
    description: "A significant monitored road condition was detected in the image.",
    icon: XCircle,
    gradient: "from-danger-500 to-danger-600",
    iconColor: "text-danger-400",
    textColor: "text-danger-400",
    bgColor: "bg-danger-500/10",
    borderColor: "border-danger-500/30",
    glow: "shadow-danger-500/20",
  },
};

export default function ConditionCard({
  condition,
}: {
  condition: ConditionLevel;
}) {
  const config = CONDITIONS[condition];
  const Icon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${config.bgColor} border ${config.borderColor} p-6 md:p-8 shadow-xl ${config.glow} animate-fade-in-up`}
    >
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative flex flex-col md:flex-row items-center gap-6">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-10 h-10 text-white" />
          </div>
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} blur-xl opacity-50`}
          />
        </div>

        {/* Content */}
        <div className="text-center md:text-left flex-1">
          <div className="text-[11px] font-mono text-white/40 tracking-widest uppercase mb-1">
            Road Condition
          </div>
          <h2 className={`text-3xl md:text-4xl font-extrabold ${config.textColor} mb-2`}>
            {config.label}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-lg text-balance">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}
