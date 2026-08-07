import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { funnelStageLabels, trlColor, trlTextColor } from "@/config/chartPalette";
import { formatCurrencyK } from "@/lib/format";
import type { Person, Project, ProjectType } from "@/types/domain";

const PAGE_SIZE = 10;

function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

const scoreClasses = {
  success: "border-success text-success",
  warning: "border-warning text-warning",
  danger: "border-danger text-danger",
} as const;

interface Props {
  projects: Project[];
  people: Person[];
  types: ProjectType[];
  onSelectProject: (id: string) => void;
}

export function ProjectTable({ projects, people, types, onSelectProject }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(Math.ceil(projects.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = projects.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [projects.length]);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[880px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border bg-app-alt/70 text-left text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
              <th className="px-3 py-2.5">Projeto</th>
              <th className="px-3 py-2.5">Tipo</th>
              <th className="px-3 py-2.5">Estágio</th>
              <th className="px-2 py-2.5 text-center">TRL</th>
              <th className="px-3 py-2.5">Saúde</th>
              <th className="px-3 py-2.5">Líder</th>
              <th className="px-3 py-2.5 text-right">VPL</th>
              <th className="px-3 py-2.5 text-right">Orçamento</th>
              <th className="px-3 py-2.5 text-center">Prioridade</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((project) => {
              const leader = people.find((p) => p.id === project.leaderId);
              const type = types.find((t) => t.id === project.type);
              const tone = scoreTone(project.priorityScoreDefault);

              return (
                <tr
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="cursor-pointer border-b border-border last:border-b-0 transition-colors hover:bg-app-alt/60"
                >
                  <td className="px-3 py-2.5">
                    <p className="max-w-[240px] truncate font-semibold text-text">{project.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-[10.5px] text-text-tertiary">{project.code}</span>
                      <VerticalBadge vertical={project.vertical} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-text-secondary">{type?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-text-secondary">{funnelStageLabels[project.funnelStage]}</td>
                  <td className="px-2 py-2.5 text-center">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md font-mono text-[10.5px] font-bold"
                      style={{ backgroundColor: trlColor(project.trl, mode), color: trlTextColor(project.trl, mode) }}
                    >
                      {project.trl}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <HealthBadge health={project.health} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-text-secondary">{leader?.name.split(" ")[0] ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-text-secondary">
                    {formatCurrencyK(project.vplValueK)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-text-secondary">
                    {formatCurrencyK(project.budgetK)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-[10.5px] font-bold ${scoreClasses[tone]}`}
                    >
                      {project.priorityScoreDefault.toFixed(0)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-[13px] text-text-tertiary">
                  Nenhum projeto encontrado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-[11.5px] text-text-tertiary">
          Mostrando {pageItems.length} de {projects.length} projeto{projects.length !== 1 ? "s" : ""} · página{" "}
          {currentPage + 1} de {pageCount}
        </p>
        <div className="flex gap-1.5">
          <button
            disabled={currentPage === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
