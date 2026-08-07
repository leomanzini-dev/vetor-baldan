import { useThemeStore } from "@/store/themeStore";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { funnelStageLabels, trlColor, trlTextColor } from "@/config/chartPalette";
import { formatCurrencyK } from "@/lib/format";
import type { FunnelStageId, Person, Project } from "@/types/domain";

const funnelOrder: FunnelStageId[] = ["captacao", "triagem", "avaliacao", "gate", "execucao", "encerrado"];

interface Props {
  projects: Project[];
  people: Person[];
  onSelectProject: (id: string) => void;
}

export function ProjectKanban({ projects, people, onSelectProject }: Props) {
  const mode = useThemeStore((s) => s.mode);

  const columns = funnelOrder.map((stage) => {
    const items = projects
      .filter((p) => p.funnelStage === stage)
      .sort((a, b) => b.priorityScoreDefault - a.priorityScoreDefault);
    const budgetTotal = items.reduce((sum, p) => sum + p.budgetK, 0);
    return { stage, items, budgetTotal };
  });

  const allEmpty = projects.length === 0;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map(({ stage, items, budgetTotal }) => (
        <div key={stage} className="flex w-[280px] shrink-0 flex-col rounded-card border border-border bg-app-alt/40">
          <div className="flex flex-col gap-1 border-b border-border px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-text">{funnelStageLabels[stage]}</p>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-app-alt px-1.5 text-[10.5px] font-bold text-text-secondary">
                {items.length}
              </span>
            </div>
            <p className="text-[10.5px] text-text-tertiary">{formatCurrencyK(budgetTotal)} comprometido</p>
          </div>

          <div className="flex max-h-[640px] flex-col gap-2.5 overflow-y-auto p-2.5">
            {items.map((project) => {
              const leader = people.find((p) => p.id === project.leaderId);
              return (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3 text-left shadow-token-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-token-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-text">{project.name}</p>
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[10.5px] font-bold"
                      style={{ backgroundColor: trlColor(project.trl, mode), color: trlTextColor(project.trl, mode) }}
                    >
                      {project.trl}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-text-tertiary">{project.code}</span>
                    <VerticalBadge vertical={project.vertical} />
                  </div>

                  <div className="flex items-center justify-between">
                    <HealthBadge health={project.health} />
                    <span className="font-mono text-[11px] font-semibold text-text">{formatCurrencyK(project.vplValueK)}</span>
                  </div>

                  {leader && (
                    <div className="flex items-center gap-1.5 border-t border-border pt-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-alt text-[9px] font-bold text-text-secondary">
                        {leader.avatarInitials}
                      </span>
                      <span className="truncate text-[10.5px] text-text-tertiary">{leader.name}</span>
                    </div>
                  )}
                </button>
              );
            })}
            {items.length === 0 && (
              <p className="py-6 text-center text-[11px] text-text-tertiary">Nenhum projeto aqui.</p>
            )}
          </div>
        </div>
      ))}

      {allEmpty && (
        <p className="w-full py-10 text-center text-[13px] text-text-tertiary">Nenhum projeto encontrado com os filtros atuais.</p>
      )}
    </div>
  );
}
