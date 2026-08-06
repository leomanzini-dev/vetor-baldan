import { useMemo } from "react";
import { FolderKanban, TrendingUp, Layers3, Target, Gauge, Users } from "lucide-react";
import {
  useCapacitySummary,
  usePeople,
  usePortfolioHighlights,
  usePortfolioScurve,
  usePortfolioSummary,
  useProjects,
} from "@/hooks/usePortfolio";
import { usePersonaStore } from "@/store/personaStore";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { VerticalDistributionChart } from "@/components/dashboard/VerticalDistributionChart";
import { FunnelPanel } from "@/components/dashboard/FunnelPanel";
import { HealthDistribution } from "@/components/dashboard/HealthDistribution";
import { PriorityListPanel } from "@/components/dashboard/PriorityListPanel";
import { AiInsightsPanel } from "@/components/dashboard/AiInsightsPanel";
import { AiBriefingCard } from "@/components/dashboard/AiBriefingCard";
import { LensProfileChart } from "@/components/dashboard/LensProfileChart";
import { PortfolioSCurveChart } from "@/components/dashboard/PortfolioSCurveChart";
import { HealthMeter, computeHealthScore } from "@/components/dashboard/HealthMeter";
import { formatCurrencyK, formatIndex, formatPercent } from "@/lib/format";
import { averageLensScores } from "@/lib/lensStats";
import {
  buildCapacitySignal,
  buildFunnelSignal,
  buildOpportunitySignal,
  buildProjectSignal,
  buildVerticalConcentrationSignal,
  type AiSignal,
} from "@/lib/aiSignals";

function getGreeting(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const severityWeight: Record<AiSignal["severity"], number> = { critical: 0, attention: 1, opportunity: 2 };

export function DashboardPage() {
  const { data: summary } = usePortfolioSummary();
  const { data: highlights } = usePortfolioHighlights();
  const { data: people } = usePeople();
  const { data: capacity } = useCapacitySummary();
  const { data: allProjects } = useProjects({});
  const { data: scurve } = usePortfolioScurve();
  const activePersonId = usePersonaStore((s) => s.activePersonId);

  const firstName = people?.find((p) => p.id === activePersonId)?.name.split(" ")[0] ?? "";
  const greeting = useMemo(() => getGreeting(new Date().getHours()), []);
  const today = useMemo(
    () => new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }),
    []
  );

  const healthResult = useMemo(() => (summary ? computeHealthScore(summary) : null), [summary]);

  const lensData = useMemo(() => (allProjects ? averageLensScores(allProjects.items) : []), [allProjects]);

  const capacityPct = useMemo(() => {
    if (!capacity || capacity.summary.length === 0) return null;
    const totalCapacity = capacity.summary.reduce((sum, c) => sum + c.monthlyCapacityPoints, 0);
    const totalCommitted = capacity.summary.reduce((sum, c) => sum + c.pointsCommitted, 0);
    if (totalCapacity === 0) return null;
    return (totalCommitted / totalCapacity) * 100;
  }, [capacity]);

  const efficiencyRatio = summary && summary.totalBudgetK > 0 ? summary.totalVplK / summary.totalBudgetK : null;

  const signals = useMemo(() => {
    if (!highlights || !summary) return [];
    const list: AiSignal[] = highlights.critical.map(buildProjectSignal);
    const capacitySignal = capacity ? buildCapacitySignal(capacity.summary) : null;
    const extras = [
      capacitySignal,
      buildVerticalConcentrationSignal(summary.byVertical, summary.total),
      buildFunnelSignal(summary.byFunnelStage),
      buildOpportunitySignal(highlights.topPriority),
    ].filter((s): s is AiSignal => s !== null);
    return [...list, ...extras].sort((a, b) => severityWeight[a.severity] - severityWeight[b.severity]);
  }, [highlights, summary, capacity]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">
          {greeting}
          {firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="mt-1 text-[13px] capitalize text-text-tertiary">{today} · visão consolidada do portfólio</p>
      </div>

      <div className="flex flex-col gap-5 rounded-card border border-primary-soft bg-primary-soft/40 p-5 shadow-token-sm dark:bg-primary-soft sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-3.5 sm:pr-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
            <FolderKanban className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-text-secondary">Portfólio Ativo</p>
            <p className="text-[28px] font-semibold leading-none tracking-tight text-text">{summary ? summary.total : "—"}</p>
          </div>
        </div>

        <div className="w-full flex-1 sm:border-x sm:border-dashed sm:border-border sm:px-6">
          {healthResult && <HealthMeter result={healthResult} />}
        </div>

        <div className="flex shrink-0 gap-6 sm:gap-8 sm:pl-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Em dia</p>
            <p className="mt-0.5 text-[15px] font-semibold text-text">{summary ? summary.onTrackCount : "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Atenção</p>
            <p className="mt-0.5 text-[15px] font-semibold text-text">{summary ? summary.attentionCount : "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Crítico</p>
            <p className="mt-0.5 text-[15px] font-semibold text-text">{summary ? summary.criticalCount : "—"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        <KpiCard label="VPL do Portfólio" value={summary ? formatCurrencyK(summary.totalVplK) : "—"} icon={TrendingUp} />
        <KpiCard label="TIR Média" value={summary ? formatPercent(summary.avgTir) : "—"} icon={Target} />
        <KpiCard
          label="Eficiência Financeira"
          value={efficiencyRatio !== null ? `${efficiencyRatio.toFixed(2)}x` : "—"}
          icon={Gauge}
        />
        <KpiCard label="TRL Médio" value={summary ? `${formatIndex(summary.avgTrl)} / 9` : "—"} icon={Layers3} />
        <KpiCard label="Capacidade da Equipe" value={capacityPct !== null ? `${capacityPct.toFixed(0)}%` : "—"} icon={Users} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
        <Panel title="Portfólio por Vertical" subtitle="Projetos ativos nos 4 P's">
          {summary && <VerticalDistributionChart data={summary.byVertical} />}
        </Panel>

        <Panel title="Funil de Inovação" subtitle="Projetos por estágio">
          {summary && <FunnelPanel data={summary.byFunnelStage} />}
        </Panel>

        <Panel title="Saúde da Execução" subtitle={summary ? `SPI médio ${formatIndex(summary.avgSpi)} · CPI médio ${formatIndex(summary.avgCpi)}` : undefined}>
          {summary && (
            <HealthDistribution
              onTrack={summary.onTrackCount}
              attention={summary.attentionCount}
              critical={summary.criticalCount}
            />
          )}
        </Panel>
      </div>

      {scurve && <PortfolioSCurveChart data={scurve} />}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))] gap-5">
        <Panel title="Perfil Estratégico do Portfólio" subtitle="Média das 8 lentes de priorização em todos os projetos ativos">
          {lensData.length > 0 && <LensProfileChart data={lensData} />}
        </Panel>

        <Panel title="Prioridade do Momento" subtitle="Top projetos pelo ranking multicritério (pesos default)">
          {highlights && <PriorityListPanel projects={highlights.topPriority} />}
        </Panel>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))] gap-5">
        <Panel title="Sinalizações da IA" subtitle="Riscos e oportunidades identificados no portfólio">
          <AiInsightsPanel signals={signals} />
        </Panel>

        <AiBriefingCard />
      </div>
    </div>
  );
}
