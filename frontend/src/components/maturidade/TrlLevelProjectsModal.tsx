import { useEffect } from "react";
import { X } from "lucide-react";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { funnelStageLabels } from "@/config/chartPalette";
import { formatCurrencyK } from "@/lib/format";
import type { TrlLevelDef } from "@/config/trl";
import type { Project } from "@/types/domain";

interface Props {
  level: number;
  def: TrlLevelDef | undefined;
  projects: Project[];
  onClose: () => void;
}

export function TrlLevelProjectsModal({ level, def, projects, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-border bg-surface shadow-token-lg">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">TRL {level}</span>
            <h2 className="truncate text-[16px] font-semibold text-text">{def?.title ?? `Nível ${level}`}</h2>
            {def && <p className="mt-1 text-[12px] leading-relaxed text-text-tertiary">{def.description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-tertiary transition-colors hover:border-primary/40 hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
            {projects.length} projeto{projects.length === 1 ? "" : "s"} neste nível
          </p>

          {projects.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-text-tertiary">Nenhum projeto neste nível de maturidade no momento.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {projects.map((project) => (
                <li key={project.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-text">{project.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-[11px] text-text-tertiary">{project.code}</span>
                      <VerticalBadge vertical={project.vertical} />
                      <span className="text-[10.5px] text-text-tertiary">{funnelStageLabels[project.funnelStage]}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12.5px] font-semibold text-text">{formatCurrencyK(project.vplValueK)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-text-tertiary">VPL</p>
                  </div>
                  <HealthBadge health={project.health} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
