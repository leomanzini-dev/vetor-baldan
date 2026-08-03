import { CheckCircle2, AlertTriangle, OctagonAlert } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { verticalChartColors, healthColors, pickThemed } from "@/config/chartPalette";
import { verticalNames } from "@/config/verticals";
import type { ProjectHealth, VerticalId } from "@/types/domain";

export function VerticalBadge({ vertical }: { vertical: VerticalId }) {
  const mode = useThemeStore((s) => s.mode);
  const color = pickThemed(mode, verticalChartColors[vertical]);
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {verticalNames[vertical]}
    </span>
  );
}

const healthIcons: Record<ProjectHealth, typeof CheckCircle2> = {
  "on-track": CheckCircle2,
  attention: AlertTriangle,
  critical: OctagonAlert,
};

const healthClasses: Record<ProjectHealth, string> = {
  "on-track": "bg-success-soft text-success",
  attention: "bg-warning-soft text-warning",
  critical: "bg-danger-soft text-danger",
};

export function HealthBadge({ health }: { health: ProjectHealth }) {
  const Icon = healthIcons[health];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${healthClasses[health]}`}
    >
      <Icon className="h-3 w-3" />
      {healthColors[health].label}
    </span>
  );
}
