import { useEffect } from "react";
import { X, Wallet, TrendingUp, CalendarClock, Gauge, User, UserCheck } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { funnelStageLabels, trlColor, trlTextColor } from "@/config/chartPalette";
import { verticalNames } from "@/config/verticals";
import { formatCurrencyK, formatDate, formatPercent } from "@/lib/format";
import { timeProgressFraction } from "@/lib/execution";
import { daysSince } from "@/lib/projectInsight";
import type { Person, Project } from "@/types/domain";

interface Props {
  project: Project;
  leader?: Person;
  sponsor?: Person;
  typeLabel?: string;
  onClose: () => void;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="font-mono text-[14px] font-semibold text-text">{value}</p>
      {hint && <p className="text-[10.5px] text-text-tertiary">{hint}</p>}
    </div>
  );
}

function PersonRow({ role, icon: Icon, person }: { role: string; icon: typeof User; person?: Person }) {
  if (!person) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-bold text-primary">
        {person.avatarInitials}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          <Icon className="h-3 w-3" />
          {role}
        </p>
        <p className="truncate text-[13px] font-semibold text-text">{person.name}</p>
        <p className="truncate text-[11px] text-text-tertiary">{person.role}</p>
      </div>
    </div>
  );
}

function BurnBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10.5px] text-text-tertiary">
        <span>{label}</span>
        <span className="font-mono font-semibold text-text-secondary">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-app-alt">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}

export function ProjectDetailModal({ project, leader, sponsor, typeLabel, onClose }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const isExecutionStage = project.funnelStage === "execucao" || project.funnelStage === "encerrado";
  const timeFrac = isExecutionStage ? timeProgressFraction(project) * 100 : 0;
  const budgetFrac = project.budgetK > 0 ? (project.spentK / project.budgetK) * 100 : 0;

  const daysToTarget = Math.round(
    (new Date(project.targetDate).getTime() - Date.now()) / 86_400_000
  );
  const scheduleHint =
    project.funnelStage === "encerrado"
      ? `Encerrado em ${formatDate(project.targetDate)}`
      : daysToTarget >= 0
        ? `${daysToTarget} dia${daysToTarget === 1 ? "" : "s"} restantes`
        : `${Math.abs(daysToTarget)} dia${Math.abs(daysToTarget) === 1 ? "" : "s"} de atraso`;

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
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold"
              style={{ backgroundColor: trlColor(project.trl, mode), color: trlTextColor(project.trl, mode) }}
            >
              {project.trl}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-text-tertiary">
                {project.code}
                {typeLabel ? ` · ${typeLabel}` : ""}
              </p>
              <h2 className="truncate text-[16.5px] font-semibold text-text">{project.name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <VerticalBadge vertical={project.vertical} />
                <HealthBadge health={project.health} />
                <span className="text-[11px] text-text-tertiary">{funnelStageLabels[project.funnelStage]}</span>
              </div>
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
          <p className="text-[13px] leading-relaxed text-text-secondary">{project.description}</p>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-app-alt px-2.5 py-1 text-[10.5px] font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 rounded-md border border-border p-3.5 sm:grid-cols-3">
            <Stat label="TIR" value={formatPercent(project.tirPercent)} />
            <Stat label="VPL" value={formatCurrencyK(project.vplValueK)} />
            <Stat
              label="Orçamento"
              value={formatCurrencyK(project.budgetK)}
              hint={isExecutionStage ? `${formatCurrencyK(project.spentK)} gasto` : "não iniciado"}
            />
            <Stat label="Início" value={formatDate(project.startDate)} hint={`há ${daysSince(project.startDate)} dias`} />
            <Stat label="Entrega prevista" value={formatDate(project.targetDate)} hint={scheduleHint} />
            <Stat label="Vertical" value={verticalNames[project.vertical]} />
          </div>

          {isExecutionStage && (
            <div className="flex flex-col gap-2.5 rounded-md border border-border p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
                <Gauge className="h-3.5 w-3.5" />
                Ritmo de execução
              </p>
              <BurnBar label="Prazo decorrido" pct={timeFrac} />
              <BurnBar label="Orçamento consumido" pct={budgetFrac} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <PersonRow role="Líder do projeto" icon={User} person={leader} />
            <PersonRow role="Patrocinador" icon={UserCheck} person={sponsor} />
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-[11px] text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" /> Prioridade padrão: {project.priorityScoreDefault.toFixed(1)}
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Score composto de 8 lentes
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> TRL {project.trl} de 9
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
