import { useEffect } from "react";
import { X } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { bandForTrl, trlBands } from "@/config/trl";
import { trlColor } from "@/config/chartPalette";
import { formatCurrencyK, formatDate, formatPercent, parseLocalDate } from "@/lib/format";
import { annualCapex, estimatedPaybackYears, projectTrl } from "@/lib/roadmap";
import type { Person, Project } from "@/types/domain";

interface Props {
  project: Project;
  leader: Person | undefined;
  sponsor: Person | undefined;
  onClose: () => void;
}

function humanize(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-text-tertiary">{label}</span>
        <span className="font-mono font-semibold text-text">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-app-alt">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ProjectRoadmapModal({ project, leader, sponsor, onClose }: Props) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const startYear = parseLocalDate(project.startDate).getFullYear();
  const targetYear = parseLocalDate(project.targetDate).getFullYear();
  const years = Array.from({ length: Math.max(targetYear - startYear + 1, 1) }, (_, i) => startYear + i);

  const roi = project.budgetK > 0 ? project.vplValueK / project.budgetK : null;
  const payback = estimatedPaybackYears(project);
  const spentPct = project.budgetK > 0 ? Math.min((project.spentK / project.budgetK) * 100, 100) : 0;
  const status = project.funnelStage === "encerrado" ? "Concluído" : trlBands.find((b) => b.id === bandForTrl(project.trl))?.label;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-border bg-surface shadow-token-lg">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Detalhes do Projeto</span>
            <h2 className="truncate text-[17px] font-semibold text-text">{project.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-text-tertiary">{project.code}</span>
              <VerticalBadge vertical={project.vertical} />
              <HealthBadge health={project.health} />
              <span className="rounded-full bg-app-alt px-2 py-0.5 text-[10.5px] font-bold text-text-secondary">{status}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-tertiary transition-colors hover:border-primary/40 hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-text-tertiary">Início</p>
              <p className="mt-0.5 font-mono text-[13px] font-bold text-text">{formatDate(project.startDate)}</p>
            </div>
            <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-text-tertiary">Conclusão prevista</p>
              <p className="mt-0.5 font-mono text-[13px] font-bold text-text">{formatDate(project.targetDate)}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Evolução TRL</p>
            <div className="flex items-center overflow-x-auto pb-1">
              {years.map((year, i) => {
                const trl = projectTrl(project, year);
                const isDark = trl >= 5;
                return (
                  <div key={year} className="flex items-center">
                    {i > 0 && <span className="h-px w-6 shrink-0 bg-border" />}
                    <div className="flex shrink-0 flex-col items-center gap-1.5">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full font-mono text-[12px] font-bold ${isDark ? "text-white" : "text-[#141413]"}`}
                        style={{ backgroundColor: trlColor(trl, mode) }}
                      >
                        {trl}
                      </span>
                      <span className="font-mono text-[10px] text-text-tertiary">{year}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Financeiro</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-text-tertiary">CAPEX Inicial</p>
                <p className="mt-0.5 font-mono text-[13px] font-bold text-text">{formatCurrencyK(project.budgetK)}</p>
              </div>
              <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-text-tertiary">CAPEX Anual (méd.)</p>
                <p className="mt-0.5 font-mono text-[13px] font-bold text-text">{formatCurrencyK(annualCapex(project))}</p>
              </div>
              <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-text-tertiary">VPL</p>
                <p className="mt-0.5 font-mono text-[13px] font-bold text-text">{formatCurrencyK(project.vplValueK)}</p>
              </div>
              <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-text-tertiary">TIR</p>
                <p className="mt-0.5 font-mono text-[13px] font-bold text-text">{formatPercent(project.tirPercent, 0)}</p>
              </div>
            </div>

            <div className="mt-2.5">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-text-tertiary">Realizado</span>
                <span className="font-mono text-text-tertiary">{formatCurrencyK(project.spentK)} de {formatCurrencyK(project.budgetK)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-app-alt">
                <div
                  className={`h-full rounded-full ${spentPct >= 100 ? "bg-danger" : "bg-info"}`}
                  style={{ width: `${spentPct}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 rounded-md border border-success bg-success-soft px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-success">ROI Estimado</p>
                <p className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[16px] font-bold text-text">{roi !== null ? `${roi.toFixed(2)}x` : "—"}</span>
                  {roi !== null && <span className="font-mono text-[11.5px] text-text-secondary">(≈ {formatCurrencyK(project.vplValueK)})</span>}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-success">Payback estimado</p>
                <p className="font-mono text-[16px] font-bold text-text">{payback !== null ? `${payback.toFixed(1)} anos` : "—"}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Outras informações</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-3">
              <p><span className="text-text-tertiary">Tipo — </span><span className="font-semibold text-text">{humanize(project.type)}</span></p>
              <p><span className="text-text-tertiary">Líder — </span><span className="font-semibold text-text">{leader?.name ?? "—"}</span></p>
              <p><span className="text-text-tertiary">Patrocinador — </span><span className="font-semibold text-text">{sponsor?.name ?? "—"}</span></p>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ScoreRow label="Risco Tecnológico" value={project.scores.riscoTecnologico} />
              <ScoreRow label="ESG" value={project.scores.esg} />
              <ScoreRow label="Aderência Estratégica" value={project.scores.aderenciaEstrategica} />
            </div>
          </div>

          {project.description && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Descrição</p>
              <p className="text-[12.5px] leading-relaxed text-text-secondary">{project.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
