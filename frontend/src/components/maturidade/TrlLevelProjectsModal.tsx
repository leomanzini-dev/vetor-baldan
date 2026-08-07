import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { funnelStageLabels } from "@/config/chartPalette";
import { formatCurrencyK } from "@/lib/format";
import { useTrlStore } from "@/store/trlStore";
import { useExecutionDetail } from "@/hooks/usePortfolio";
import { ProjectHoverCard } from "@/components/maturidade/ProjectHoverCard";
import type { TrlLevelDef } from "@/config/trl";
import type { Person, Project } from "@/types/domain";

interface Props {
  level: number;
  def: TrlLevelDef | undefined;
  projects: Project[];
  people: Person[];
  onClose: () => void;
}

const CARD_WIDTH = 400;
const CARD_MARGIN = 12;
const CARD_ESTIMATED_HEIGHT = 480;
const HOVER_CLOSE_DELAY = 120;

// A altura real do card varia com o conteúdo (status report tem mais texto
// que o diagnóstico sintetizado do funil, nomes longos quebram linha, etc.),
// então a posição é calculada em duas passadas: uma estimativa imediata no
// mouseEnter (evita esperar um frame para o card aparecer) e uma correção via
// useLayoutEffect assim que o card real é medido (ver handleRowEnter/measure
// abaixo) — sempre com maxHeight+overflow como rede de segurança final para
// telas baixas, onde nem o clamp de topo é suficiente.
function computeCardStyle(rect: DOMRect, cardHeight: number): CSSProperties {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  let left = rect.right + CARD_MARGIN;
  if (left + CARD_WIDTH > viewportW - 8) {
    left = rect.left - CARD_WIDTH - CARD_MARGIN;
  }
  left = Math.max(8, Math.min(left, viewportW - CARD_WIDTH - 8));

  const maxHeight = viewportH - 16;
  const effectiveHeight = Math.min(cardHeight, maxHeight);

  let top = rect.top;
  top = Math.min(top, viewportH - effectiveHeight - 8);
  top = Math.max(8, top);

  return { position: "fixed", top, left, width: CARD_WIDTH, maxHeight, overflowY: "auto" };
}

export function TrlLevelProjectsModal({ level, def, projects, people, onClose }: Props) {
  const trlLevels = useTrlStore((s) => s.levels);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [cardStyle, setCardStyle] = useState<CSSProperties | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    function closeOnResize() {
      setHoveredProject(null);
    }
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Corrige a posição com a altura REAL do card assim que ele é medido —
  // a primeira renderização usa uma estimativa (computeCardStyle chamado no
  // mouseEnter) só para o card já aparecer no lugar certo sem esperar um
  // frame; esse efeito roda antes do paint e ajusta o "top" para o card nunca
  // vazar por baixo da viewport, mesmo em linhas próximas do rodapé da tela.
  useLayoutEffect(() => {
    if (!hoveredProject || !anchorRect || !cardRef.current) return;
    const actualHeight = cardRef.current.getBoundingClientRect().height;
    setCardStyle(computeCardStyle(anchorRect, actualHeight));
  }, [hoveredProject, anchorRect]);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function handleRowEnter(e: React.MouseEvent<HTMLLIElement>, project: Project) {
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
    setCardStyle(computeCardStyle(rect, CARD_ESTIMATED_HEIGHT));
    setHoveredProject(project);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setHoveredProject(null), HOVER_CLOSE_DELAY);
  }

  const isExecutionStage = hoveredProject?.funnelStage === "execucao" || hoveredProject?.funnelStage === "encerrado";
  const { data: executionDetail, isLoading: executionLoading } = useExecutionDetail(
    hoveredProject && isExecutionStage ? hoveredProject.id : null
  );
  const nextLevel = hoveredProject ? trlLevels.find((l) => l.level === hoveredProject.trl + 1) : undefined;
  const leader = hoveredProject ? people.find((p) => p.id === hoveredProject.leaderId) : undefined;
  const sponsor = hoveredProject ? people.find((p) => p.id === hoveredProject.sponsorId) : undefined;

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

        <div className="overflow-y-auto px-5 py-4" onScroll={() => setHoveredProject(null)}>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
            {projects.length} projeto{projects.length === 1 ? "" : "s"} neste nível
            {projects.length > 0 && (
              <span className="ml-2 font-normal normal-case tracking-normal text-text-tertiary">
                · passe o mouse sobre um projeto para ver o diagnóstico
              </span>
            )}
          </p>

          {projects.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-text-tertiary">Nenhum projeto neste nível de maturidade no momento.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {projects.map((project) => (
                <li
                  key={project.id}
                  onMouseEnter={(e) => handleRowEnter(e, project)}
                  onMouseLeave={scheduleClose}
                  className="-mx-2 flex flex-wrap items-center gap-3 rounded-md px-2 py-3 transition-colors first:pt-2 last:pb-2 hover:bg-app-alt"
                >
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

      {hoveredProject && cardStyle && (
        <ProjectHoverCard
          ref={cardRef}
          project={hoveredProject}
          leader={leader}
          sponsor={sponsor}
          nextLevel={nextLevel}
          executionDetail={executionDetail}
          executionLoading={!!isExecutionStage && executionLoading}
          style={cardStyle}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        />
      )}
    </div>
  );
}
