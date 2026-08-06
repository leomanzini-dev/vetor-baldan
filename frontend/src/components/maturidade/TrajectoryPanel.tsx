import { ArrowRight } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { VerticalBadge } from "@/components/ui/Badge";
import { trlColor } from "@/config/chartPalette";
import { formatDate, parseLocalDate } from "@/lib/format";
import type { Project } from "@/types/domain";

export function TrajectoryPanel({ projects }: { projects: Project[] }) {
  const mode = useThemeStore((s) => s.mode);

  const upcoming = [...projects]
    .filter((p) => p.trl < 9 && p.funnelStage !== "encerrado")
    .sort((a, b) => parseLocalDate(a.targetDate).getTime() - parseLocalDate(b.targetDate).getTime())
    .slice(0, 8);

  return (
    <ul className="flex flex-col divide-y divide-border">
      {upcoming.map((project) => (
        <li key={project.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white"
            style={{ backgroundColor: trlColor(project.trl, mode) }}
          >
            {project.trl}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white opacity-60"
            style={{ backgroundColor: trlColor(Math.min(project.trl + 1, 9), mode) }}
          >
            {Math.min(project.trl + 1, 9)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-text">{project.name}</p>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="font-mono text-[10.5px] text-text-tertiary">{project.code}</span>
              <VerticalBadge vertical={project.vertical} />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11.5px] font-semibold text-text">{formatDate(project.targetDate)}</p>
            <p className="text-[10px] uppercase tracking-wide text-text-tertiary">próximo marco</p>
          </div>
        </li>
      ))}
      {upcoming.length === 0 && (
        <li className="py-8 text-center text-[13px] text-text-tertiary">Nenhum projeto em maturação no momento.</li>
      )}
    </ul>
  );
}
