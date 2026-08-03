import { useMemo } from "react";
import { FolderKanban, TrendingUp, Layers3, Target } from "lucide-react";
import { usePeople, usePortfolioHighlights, usePortfolioSummary } from "@/hooks/usePortfolio";
import { usePersonaStore } from "@/store/personaStore";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { VerticalDistributionChart } from "@/components/dashboard/VerticalDistributionChart";
import { FunnelPanel } from "@/components/dashboard/FunnelPanel";
import { HealthDistribution } from "@/components/dashboard/HealthDistribution";
import { PriorityListPanel } from "@/components/dashboard/PriorityListPanel";
import { AiSignalsPanel } from "@/components/dashboard/AiSignalsPanel";
import { formatCurrencyK, formatIndex, formatPercent } from "@/lib/format";
import { buildFunnelSignal, buildProjectSignal } from "@/lib/aiSignals";

function getGreeting(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function DashboardPage() {
  const { data: summary } = usePortfolioSummary();
  const { data: highlights } = usePortfolioHighlights();
  const { data: people } = usePeople();
  const activePersonId = usePersonaStore((s) => s.activePersonId);

  const firstName = people?.find((p) => p.id === activePersonId)?.name.split(" ")[0] ?? "";
  const greeting = useMemo(() => getGreeting(new Date().getHours()), []);
  const today = useMemo(
    () => new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }),
    []
  );

  const signals = useMemo(() => {
    if (!highlights || !summary) return [];
    const projectSignals = highlights.critical.map(buildProjectSignal);
    const funnelSignal = buildFunnelSignal(summary.byFunnelStage);
    return funnelSignal ? [...projectSignals, funnelSignal] : projectSignals;
  }, [highlights, summary]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">
          {greeting}
          {firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="mt-1 text-[13px] capitalize text-text-tertiary">{today} · visão consolidada do portfólio</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          featured
          label="Portfólio Ativo"
          value={summary ? String(summary.total) : "—"}
          icon={FolderKanban}
          meta={
            summary
              ? [
                  { label: "Em dia", value: String(summary.onTrackCount) },
                  { label: "Atenção", value: String(summary.attentionCount) },
                  { label: "Crítico", value: String(summary.criticalCount) },
                ]
              : undefined
          }
        />
        <KpiCard label="TIR Média" value={summary ? formatPercent(summary.avgTir) : "—"} icon={Target} />
        <KpiCard label="VPL do Portfólio" value={summary ? formatCurrencyK(summary.totalVplK) : "—"} icon={TrendingUp} />
        <KpiCard label="TRL Médio" value={summary ? `${formatIndex(summary.avgTrl)} / 9` : "—"} icon={Layers3} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Portfólio por Vertical" subtitle="Projetos ativos nos 4 P's" className="lg:col-span-1">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Prioridade do Momento" subtitle="Top projetos pelo ranking multicritério (pesos default)">
          {highlights && <PriorityListPanel projects={highlights.topPriority} />}
        </Panel>

        <Panel title="Sinalizações da IA" subtitle="Pontos de atenção identificados no portfólio">
          <AiSignalsPanel signals={signals} />
        </Panel>
      </div>
    </div>
  );
}
