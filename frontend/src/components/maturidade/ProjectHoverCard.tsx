import { forwardRef, type CSSProperties } from "react";
import {
  OctagonAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  User,
  UserCheck,
  Loader2,
  Gauge,
} from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { funnelStageLabels, trlColor, trlTextColor } from "@/config/chartPalette";
import { formatCurrencyK, formatDate, formatIndex, formatPercent } from "@/lib/format";
import { timeProgressFraction } from "@/lib/execution";
import { buildFunnelDiagnosis, daysSince, formatDurationPtBr } from "@/lib/projectInsight";
import type { TrlLevelDef } from "@/config/trl";
import type { Person, Project, ProjectExecutionDetail } from "@/types/domain";

interface Props {
  project: Project;
  leader?: Person;
  sponsor?: Person;
  nextLevel?: TrlLevelDef;
  executionDetail?: ProjectExecutionDetail;
  executionLoading: boolean;
  style: CSSProperties;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const diagnosisIcon = { critical: OctagonAlert, attention: AlertTriangle, "on-track": CheckCircle2 } as const;
const diagnosisTone = {
  critical: "text-danger",
  attention: "text-warning",
  "on-track": "text-success",
} as const;

function MiniIndex({ label, value }: { label: string; value: number }) {
  const good = value >= 0.97;
  const Icon = good ? TrendingUp : TrendingDown;
  return (
    <div
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 ${
        good ? "border-success-soft bg-success-soft" : "border-danger-soft bg-danger-soft"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${good ? "text-success" : "text-danger"}`} />
      <div>
        <p className="font-mono text-[13px] font-bold leading-none text-text">{formatIndex(value)}</p>
        <p className="text-[9px] uppercase tracking-wide text-text-tertiary">{label}</p>
      </div>
    </div>
  );
}

function BurnRow({ label, pct, warn }: { label: string; pct: number; warn: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-text-tertiary">
        <span>{label}</span>
        <span className={`font-mono font-semibold ${warn ? "text-warning" : "text-text-secondary"}`}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-app-alt">
        <div
          className={`h-full rounded-full ${warn ? "bg-warning" : "bg-primary"}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, wrap }: { label: string; value: string; wrap?: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <p className={`text-[12.5px] font-semibold text-text ${wrap ? "leading-snug" : "truncate"}`}>{value}</p>
      <p className="text-[9.5px] uppercase tracking-wide text-text-tertiary">{label}</p>
    </div>
  );
}

export const ProjectHoverCard = forwardRef<HTMLDivElement, Props>(function ProjectHoverCard(
  { project, leader, sponsor, nextLevel, executionDetail, executionLoading, style, onMouseEnter, onMouseLeave },
  ref
) {
  const mode = useThemeStore((s) => s.mode);
  const isExecutionStage = project.funnelStage === "execucao" || project.funnelStage === "encerrado";
  const DiagnosisIcon = diagnosisIcon[project.health];
  const report = executionDetail?.statusReport;

  const timeFrac = isExecutionStage ? timeProgressFraction(project) * 100 : 0;
  const budgetFrac = project.budgetK > 0 ? (project.spentK / project.budgetK) * 100 : 0;
  const budgetOutpacesSchedule = isExecutionStage && budgetFrac - timeFrac > 15;

  const funnelDiagnosis = !isExecutionStage ? buildFunnelDiagnosis(project) : null;

  return (
    <div
      ref={ref}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed z-[120] flex w-[400px] flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-token-lg"
      role="tooltip"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
          style={{ backgroundColor: trlColor(project.trl, mode), color: trlTextColor(project.trl, mode) }}
        >
          {project.trl}
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-text">{project.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10.5px] text-text-tertiary">{project.code}</span>
            <VerticalBadge vertical={project.vertical} />
            <span className="text-[10.5px] text-text-tertiary">{funnelStageLabels[project.funnelStage]}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <HealthBadge health={project.health} />
        <span className="text-[10.5px] text-text-tertiary">
          {formatDurationPtBr(daysSince(project.startDate))} de idade · entrega {formatDate(project.targetDate)}
        </span>
      </div>

      {/* Diagnóstico */}
      <div className="rounded-md border border-border bg-app-alt p-2.5">
        <div className="mb-1 flex items-center gap-1.5">
          <DiagnosisIcon className={`h-3.5 w-3.5 shrink-0 ${diagnosisTone[project.health]}`} />
          <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
            Por que está {project.health === "critical" ? "crítico" : project.health === "attention" ? "em atenção" : "em dia"}
          </p>
        </div>

        {isExecutionStage ? (
          executionLoading ? (
            <p className="flex items-center gap-1.5 text-[11.5px] text-text-tertiary">
              <Loader2 className="h-3 w-3 animate-spin" /> Carregando status report...
            </p>
          ) : report ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-[12px] leading-relaxed text-text-secondary">{report.summary}</p>
              <p className="text-[12px] leading-relaxed text-text-secondary">
                <span className="font-semibold text-text">Risco: </span>
                {report.risks}
              </p>
            </div>
          ) : (
            <p className="text-[11.5px] text-text-tertiary">Sem status report disponível para este projeto.</p>
          )
        ) : (
          <div className="flex flex-col gap-1.5">
            <p className="text-[12px] leading-relaxed text-text-secondary">{funnelDiagnosis?.headline}</p>
            <p className="text-[12px] leading-relaxed text-text-secondary">{funnelDiagnosis?.detail}</p>
          </div>
        )}
      </div>

      {/* Indicadores de execução */}
      {isExecutionStage && report && (
        <div className="flex gap-2">
          <MiniIndex label="SPI" value={report.spi} />
          <MiniIndex label="CPI" value={report.cpi} />
        </div>
      )}

      {isExecutionStage && (
        <div className="flex flex-col gap-2 rounded-md border border-border p-2.5">
          <BurnRow label="Prazo decorrido" pct={timeFrac} warn={false} />
          <BurnRow label="Orçamento consumido" pct={budgetFrac} warn={budgetOutpacesSchedule} />
          {budgetOutpacesSchedule && (
            <p className="flex items-start gap-1.5 text-[11px] leading-snug text-warning">
              <Gauge className="h-3.5 w-3.5 shrink-0" />
              Consumindo orçamento mais rápido do que o prazo decorrido.
            </p>
          )}
        </div>
      )}

      {/* Próximo passo */}
      <div className="flex gap-2 rounded-md border border-border bg-app-alt p-2.5">
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Próximo passo</p>
          {isExecutionStage && report ? (
            <p className="mt-0.5 text-[12px] leading-relaxed text-text-secondary">{report.nextSteps}</p>
          ) : nextLevel ? (
            <p className="mt-0.5 text-[12px] leading-relaxed text-text-secondary">
              Para avançar a TRL {nextLevel.level} ({nextLevel.title}): {nextLevel.requirements}
            </p>
          ) : (
            <p className="mt-0.5 text-[12px] leading-relaxed text-text-secondary">
              Projeto já no nível máximo de maturidade.
            </p>
          )}
        </div>
      </div>

      {/* Financeiro */}
      <div className="flex items-center gap-3 border-t border-border pt-2.5">
        <Wallet className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
        <Stat label="VPL" value={formatCurrencyK(project.vplValueK)} />
        <Stat label="TIR" value={formatPercent(project.tirPercent)} />
        <Stat
          label="Orçamento"
          value={isExecutionStage ? `${formatCurrencyK(project.spentK)} / ${formatCurrencyK(project.budgetK)}` : formatCurrencyK(project.budgetK)}
          wrap
        />
      </div>

      {/* Responsáveis */}
      {(leader || sponsor) && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
          {leader && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
              <p className="truncate text-[11.5px] text-text-secondary">
                <span className="text-text-tertiary">Líder · </span>
                {leader.name}
              </p>
            </div>
          )}
          {sponsor && (
            <div className="flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
              <p className="truncate text-[11.5px] text-text-secondary">
                <span className="text-text-tertiary">Patrocinador · </span>
                {sponsor.name}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
