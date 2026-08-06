import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { VerticalBadge } from "@/components/ui/Badge";
import { trlColor } from "@/config/chartPalette";
import { bandForTrl, trlBands } from "@/config/trl";
import { formatCurrencyK, formatDate } from "@/lib/format";
import { estimatedPaybackYears, projectTrl } from "@/lib/roadmap";
import type { Person, Project } from "@/types/domain";

interface Props {
  projects: Project[];
  people: Person[];
  onSelectProject: (id: string) => void;
}

const PAGE_SIZE = 10;
const YEARS_AHEAD = 5;

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

export function PortfolioRoadmapTable({ projects, people, onSelectProject }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const years = useMemo(() => {
    const nowYear = new Date().getFullYear();
    return Array.from({ length: YEARS_AHEAD }, (_, i) => nowYear + i);
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
  }, [projects, search]);

  const pageCount = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar por nome ou código..."
          className="w-full rounded-md border border-border bg-app-alt py-2 pl-9 pr-3 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[1080px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border bg-app-alt/70 text-left text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
              <th className="px-3 py-2.5">Projeto</th>
              <th className="px-3 py-2.5">Responsável</th>
              <th className="px-3 py-2.5">Início</th>
              {years.map((y) => (
                <th key={y} className="px-1.5 py-2.5 text-center">
                  {y}
                </th>
              ))}
              <th className="px-3 py-2.5 text-right">CAPEX Inicial</th>
              <th className="px-3 py-2.5 text-right">ROI Previsto</th>
              <th className="px-3 py-2.5 text-right">Payback</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((project) => {
              const leader = people.find((p) => p.id === project.leaderId);
              const payback = estimatedPaybackYears(project);
              const roi = project.budgetK > 0 ? project.vplValueK / project.budgetK : null;
              const status = project.funnelStage === "encerrado" ? "Concluído" : trlBands.find((b) => b.id === bandForTrl(project.trl))?.label;
              const tone = scoreTone(project.priorityScoreDefault);

              return (
                <tr
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="cursor-pointer border-b border-border last:border-b-0 transition-colors hover:bg-app-alt/60"
                >
                  <td className="px-3 py-2.5">
                    <p className="max-w-[220px] truncate font-semibold text-text">{project.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-[10.5px] text-text-tertiary">{project.code}</span>
                      <VerticalBadge vertical={project.vertical} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-text-secondary">{leader?.name.split(" ")[0] ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-text-tertiary">{formatDate(project.startDate)}</td>
                  {years.map((y) => {
                    const trl = projectTrl(project, y);
                    const bg = trlColor(trl, mode);
                    const isDark = trl >= 5;
                    return (
                      <td key={y} className="p-1 text-center">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-md font-mono text-[11px] font-bold ${isDark ? "text-white" : "text-[#141413]"}`}
                          style={{ backgroundColor: bg }}
                        >
                          {trl}
                        </span>
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-text-secondary">{formatCurrencyK(project.budgetK)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <span className="font-mono font-semibold text-text">{roi !== null ? `${roi.toFixed(2)}x` : "—"}</span>
                    <span className="block font-mono text-[10px] text-text-tertiary">({formatCurrencyK(project.vplValueK)})</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-text-secondary">
                    {payback !== null ? `${payback.toFixed(1)} anos` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-text-secondary">{status}</td>
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
                <td colSpan={8 + YEARS_AHEAD} className="py-8 text-center text-[13px] text-text-tertiary">
                  Nenhum projeto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-[11.5px] text-text-tertiary">
          Mostrando {pageItems.length} de {filtered.length} projeto{filtered.length !== 1 ? "s" : ""} · página {currentPage + 1} de {pageCount}
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
