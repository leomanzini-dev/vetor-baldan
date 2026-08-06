import { VerticalBadge } from "@/components/ui/Badge";
import type { Project } from "@/types/domain";

export function PriorityListPanel({ projects }: { projects: Project[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {projects.map((project, i) => (
        <li key={project.id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-app-alt font-mono text-[12px] font-bold text-text-secondary">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold text-text">{project.name}</p>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="font-mono text-[11px] text-text-tertiary">{project.code}</span>
              <VerticalBadge vertical={project.vertical} />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-bold text-primary">{project.priorityScoreDefault.toFixed(1)}</p>
            <p className="text-[10px] uppercase tracking-wide text-text-tertiary">score</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
