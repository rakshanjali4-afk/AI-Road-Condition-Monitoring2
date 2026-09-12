import { AlertTriangle, Gauge, Construction, Layers, type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="card-hover group">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className={`text-3xl font-bold ${color} tabular-nums`}>
          {value}
        </span>
      </div>
      <p className="text-sm font-medium text-white/70">{label}</p>
    </div>
  );
}

interface ResultStatsProps {
  roadDamage: number;
  speedBump: number;
  unsurfacedRoad: number;
  total: number;
}

export default function ResultStats({
  roadDamage,
  speedBump,
  unsurfacedRoad,
  total,
}: ResultStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={AlertTriangle}
        label="Road Damage"
        value={roadDamage}
        color="text-danger-400"
        bgColor="bg-danger-500/15"
      />
      <StatCard
        icon={Gauge}
        label="Speed Bump"
        value={speedBump}
        color="text-amber-400"
        bgColor="bg-amber-500/15"
      />
      <StatCard
        icon={Construction}
        label="Unsurfaced Road"
        value={unsurfacedRoad}
        color="text-amber-400"
        bgColor="bg-amber-500/15"
      />
      <StatCard
        icon={Layers}
        label="Total Detections"
        value={total}
        color="text-cyan-400"
        bgColor="bg-cyan-500/15"
      />
    </div>
  );
}
