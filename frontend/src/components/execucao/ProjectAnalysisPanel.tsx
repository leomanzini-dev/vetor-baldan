import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, OctagonAlert, Globe, CircleAlert, ArrowRightLeft } from "lucide-react";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { internalRiskReasons, reallocationSuggestion } from "@/lib/projectRisk";
import { ProjectRiskAnalysisModal } from "@/components/execucao/ProjectRiskAnalysisModal";
import { useProjectTypes } from "@/hooks/usePortfolio";
import type { Project, ProjectHealth } from "@/types/domain";

interface Props {
  projects: Project[]; // já filtrados: em execução
}

const kpiMeta: Record<ProjectHealth, { label: string; icon: typeof ShieldCheck; classes: string }> = {
  "on-track": { label: "Saudáveis", icon: ShieldCheck, classes: "text-success" },
  attention: { label: "Em atenção", icon: ShieldAlert, classes: "text-warning" },
  critical: { label: "Em risco", icon: OctagonAlert, classes: "text-danger" },
};

export function ProjectAnalysisPanel({ projects }: Props) {
  const [aiFor, setAiFor] = useState<Project | null>(null);
  const { data: projectTypes } = useProjectTypes();
  const typeNameById = useMemo(() => new Map((projectTypes ?? []).map((t) => [t.id, t.name])), [projectTypes]);

  const counts: Record<ProjectHealth, number> = {
    "on-track": projects.filter((p) => p.health === "on-track").length,
    attention: projects.filter((p) => p.health === "attention").length,
    critical: projects.filter((p) => p.health === "critical").length,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {(Object.keys(kpiMeta) as ProjectHealth[]).map((key) => {
          const meta = kpiMeta[key];
          const Icon = meta.icon;
          return (
            <div key={key} className="rounded-card border border-border bg-surface px-4 py-3.5 shadow-token-sm">
              <div className={`flex items-center gap-2 ${meta.classes}`}>
                <Icon className="h-4 w-4" />
                <p className="text-[10.5px] font-bold uppercase tracking-wide">{meta.label}</p>
              </div>
              <p className="mt-1.5 text-[26px] font-bold leading-none text-text">{counts[key]}</p>
              <p className="mt-1 text-[11px] text-text-tertiary">de {projects.length} projetos em execução</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3.5">
        {projects.map((project) => {
          const reasons = internalRiskReasons(project);
          const suggestion = reallocationSuggestion(project, projects);
          return (
            <div key={project.id} className="rounded-card border border-border bg-surface p-4 shadow-token-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[220px] flex-1">
                  <p className="truncate text-[14px] font-semibold text-text">{project.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-text-tertiary">{project.code}</span>
                    <VerticalBadge vertical={project.vertical} />
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <HealthBadge health={project.health} />
                  <span className="rounded-full bg-app-alt px-2.5 py-1 text-[11px] font-bold text-text-secondary">TRL {project.trl}</span>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-center">
                  <div className="rounded-md bg-app-alt/60 px-3 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary">Função</p>
                    <p className="mt-0.5 max-w-[120px] truncate text-[11px] font-semibold text-text" title={typeNameById.get(project.type) ?? project.type}>
                      {typeNameById.get(project.type) ?? project.type}
                    </p>
                  </div>
                  <div className="rounded-md bg-app-alt/60 px-3 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary">SPI</p>
                    <p className="mt-0.5 font-mono text-[13px] font-bold text-text">{project.spi !== null ? project.spi.toFixed(2) : "—"}</p>
                  </div>
                  <div className="rounded-md bg-app-alt/60 px-3 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary">CPI</p>
                    <p className="mt-0.5 font-mono text-[13px] font-bold text-text">{project.cpi !== null ? project.cpi.toFixed(2) : "—"}</p>
                  </div>
                </div>

                <button
                  onClick={() => setAiFor(project)}
                  className="ml-auto flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-[12px] font-bold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Analisar fatores externos (IA)
                </button>
              </div>

              {(reasons.length > 0 || suggestion) && (
                <div className="mt-3 flex flex-col gap-2 border-t border-dashed border-border pt-3 lg:flex-row lg:items-start lg:gap-4">
                  {reasons.length > 0 && (
                    <div className="flex-1">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Por que está assim</p>
                      <ul className="flex flex-col gap-1">
                        {reasons.map((r) => (
                          <li
                            key={r.label}
                            className={`flex items-start gap-1.5 text-[11.5px] leading-snug ${r.severity === "alta" ? "text-danger" : "text-warning"}`}
                          >
                            <CircleAlert className="mt-0.5 h-3 w-3 shrink-0" />
                            <span>{r.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestion && (
                    <div className="flex flex-1 items-start gap-2 rounded-md border border-primary-soft bg-primary-soft/40 px-3 py-2.5">
                      <ArrowRightLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <p className="text-[11.5px] leading-snug text-text">
                        Considere realocar recursos de <span className="font-semibold">{project.code}</span> para{" "}
                        <span className="font-semibold">
                          {suggestion.to.code} · {suggestion.to.name}
                        </span>{" "}
                        — prioridade maior ({suggestion.to.priorityScoreDefault.toFixed(0)} vs {project.priorityScoreDefault.toFixed(0)}) e saúde{" "}
                        {suggestion.to.health === "on-track" ? "saudável" : "em atenção"}
                        {suggestion.sameVertical ? ", mesma vertical" : ""}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {projects.length === 0 && <p className="py-8 text-center text-[12.5px] text-text-tertiary">Nenhum projeto em execução.</p>}
      </div>

      {aiFor && <ProjectRiskAnalysisModal project={aiFor} onClose={() => setAiFor(null)} />}
    </div>
  );
}
