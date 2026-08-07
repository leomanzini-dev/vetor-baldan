import { MousePointerClick, Ban, Clock, CheckCircle2 } from "lucide-react";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { formatCurrencyK, formatDate, formatPercent } from "@/lib/format";
import { annualCapex, estimatedPaybackYears } from "@/lib/roadmap";
import { useMicroStagesStore } from "@/store/microStagesStore";
import type { CapacitySummary, MicroStage, Person, Project } from "@/types/domain";

interface Props {
  project: Project | null;
  peopleById: Map<string, Person>;
  summary: CapacitySummary[];
}

function humanize(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Recommendation = { label: string; classes: string };

function continuityRecommendation(project: Project): Recommendation {
  if (project.health === "critical" && project.priorityScoreDefault < 50) {
    return { label: "Reavaliar continuidade — saúde crítica e prioridade baixa no portfólio", classes: "border-danger bg-danger-soft text-danger" };
  }
  if (project.health === "critical") {
    return { label: "Continuar, mas com plano de recuperação — indicadores críticos (SPI/CPI)", classes: "border-warning bg-warning-soft text-warning" };
  }
  if (project.health === "attention") {
    return { label: "Continuar com acompanhamento reforçado", classes: "border-warning bg-warning-soft text-warning" };
  }
  return { label: "Continuar — dentro do esperado", classes: "border-success bg-success-soft text-success" };
}

function mvpStatus(project: Project): string {
  if (project.trl >= 7) return `MVP validado em operação piloto/real (TRL ${project.trl})`;
  if (project.trl >= 6) return `MVP demonstrado em ambiente relevante, ainda não operacional (TRL ${project.trl})`;
  if (project.trl >= 4) return `Protótipo funcional existe, mas ainda sem MVP validado em campo (TRL ${project.trl})`;
  return `Ainda não há MVP — projeto em fase conceitual/analítica (TRL ${project.trl})`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
      <p className="text-[9.5px] font-bold uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[13px] font-bold text-text">{value}</p>
    </div>
  );
}

export function ProjectDetailPanel({ project, peopleById, summary }: Props) {
  const impediments = useMicroStagesStore((s) => s.impediments);

  if (!project) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center">
        <MousePointerClick className="h-5 w-5 text-text-tertiary" />
        <p className="text-[12.5px] text-text-tertiary">Selecione um projeto em "Alocação por Projeto" para ver o detalhamento completo.</p>
      </div>
    );
  }

  const roi = project.budgetK > 0 ? project.vplValueK / project.budgetK : null;
  const payback = estimatedPaybackYears(project);
  const spentPct = project.budgetK > 0 ? Math.min((project.spentK / project.budgetK) * 100, 100) : 0;
  const leader = peopleById.get(project.leaderId);
  const sponsor = peopleById.get(project.sponsorId);
  const recommendation = continuityRecommendation(project);

  const issues = summary
    .flatMap((s) =>
      (s.microStages as MicroStage[])
        .filter((m) => m.projectId === project.id && m.status !== "concluida")
        .map((m) => ({ m, personName: s.person.name, personAvatar: s.person.avatarInitials }))
    )
    .filter(({ m }) => impediments[m.id] || m.dueDate < new Date().toISOString().slice(0, 10));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-text">{project.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-text-tertiary">{project.code}</span>
              <VerticalBadge vertical={project.vertical} />
              <HealthBadge health={project.health} />
              <span className="rounded-full bg-app-alt px-2 py-0.5 text-[10.5px] font-bold text-text-secondary">TRL {project.trl}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-md border px-3.5 py-3 text-[12.5px] font-semibold ${recommendation.classes}`}>{recommendation.label}</div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field label="Início" value={formatDate(project.startDate)} />
        <Field label="Conclusão prevista" value={formatDate(project.targetDate)} />
        <Field label="SPI" value={project.spi !== null ? project.spi.toFixed(2) : "—"} />
        <Field label="CPI" value={project.cpi !== null ? project.cpi.toFixed(2) : "—"} />
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Financeiro</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Field label="CAPEX (orçamento)" value={formatCurrencyK(project.budgetK)} />
          <Field label="CAPEX anual (méd.)" value={formatCurrencyK(annualCapex(project))} />
          <Field label="VPL" value={formatCurrencyK(project.vplValueK)} />
          <Field label="TIR" value={formatPercent(project.tirPercent, 0)} />
        </div>

        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-text-tertiary">Realizado</span>
            <span className="font-mono text-text-tertiary">
              {formatCurrencyK(project.spentK)} de {formatCurrencyK(project.budgetK)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-app-alt">
            <div className={`h-full rounded-full ${spentPct >= 100 ? "bg-danger" : "bg-info"}`} style={{ width: `${spentPct}%` }} />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 rounded-md border border-success bg-success-soft px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-success">ROI Estimado</p>
            <p className="font-mono text-[16px] font-bold text-text">{roi !== null ? `${roi.toFixed(2)}x` : "—"}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-success">Payback estimado</p>
            <p className="font-mono text-[16px] font-bold text-text">{payback !== null ? `${payback.toFixed(1)} anos` : "—"}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Mercado &amp; Maturidade</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-text-tertiary">Índice de Mercado (Inovação &amp; Diferenciação)</span>
              <span className="font-mono font-semibold text-text">{project.scores.mercado}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-app-alt">
              <div className="h-full rounded-full bg-primary" style={{ width: `${project.scores.mercado}%` }} />
            </div>
          </div>
          <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5 text-[11.5px] text-text-secondary">{mvpStatus(project)}</div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Situação das micro-etapas</p>
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-success-soft bg-success-soft px-3 py-2.5 text-[12px] text-success">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Sem atrasos ou impedimentos em aberto neste projeto.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {issues.map(({ m, personName, personAvatar }) => {
              const reason = impediments[m.id];
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-[11.5px] ${
                    reason ? "border-danger-soft bg-danger-soft/40" : "border-warning-soft bg-warning-soft/40"
                  }`}
                >
                  {reason ? <Ban className="h-3.5 w-3.5 shrink-0 text-danger" /> : <Clock className="h-3.5 w-3.5 shrink-0 text-warning" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{m.name}</p>
                    <p className="truncate text-text-tertiary">{reason ?? `venceu em ${formatDate(m.dueDate)}`}</p>
                  </div>
                  <span
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-app-alt px-2 py-1 text-[10.5px] font-medium text-text-secondary"
                    title={personName}
                  >
                    <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-nav text-[8px] font-bold text-nav-text">
                      {personAvatar}
                    </span>
                    {personName.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Outras informações</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-3">
          <p>
            <span className="text-text-tertiary">Tipo — </span>
            <span className="font-semibold text-text">{humanize(project.type)}</span>
          </p>
          <p>
            <span className="text-text-tertiary">Líder — </span>
            <span className="font-semibold text-text">{leader?.name ?? "—"}</span>
          </p>
          <p>
            <span className="text-text-tertiary">Patrocinador — </span>
            <span className="font-semibold text-text">{sponsor?.name ?? "—"}</span>
          </p>
        </div>
      </div>

      {project.description && (
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Descrição</p>
          <p className="text-[12.5px] leading-relaxed text-text-secondary">{project.description}</p>
        </div>
      )}
    </div>
  );
}
