import { useState } from "react";
import { Plus, Table2, Kanban, Layers, Rocket, Wallet, TrendingUp, OctagonAlert } from "lucide-react";
import { usePortfolioSummary } from "@/hooks/usePortfolio";
import { Panel } from "@/components/ui/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { HealthDistribution } from "@/components/dashboard/HealthDistribution";
import { ProjectCatalog, type CatalogView } from "@/components/projetos/ProjectCatalog";
import { NewProjectModal } from "@/components/projetos/NewProjectModal";
import { formatCurrencyK } from "@/lib/format";

export function ProjetosPage() {
  const [view, setView] = useState<CatalogView>("tabela");
  const [showNewProject, setShowNewProject] = useState(false);
  const { data: summary } = usePortfolioSummary();

  const executingCount = summary?.byFunnelStage.find((s) => s.stage === "execucao")?.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Catálogo de Projetos</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Todos os projetos do portfólio da Baldan — organizados, filtráveis e prontos para decisão. É também a
          porta de entrada de novas ideias, já avaliadas por IA no momento da submissão.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(5,1fr)]">
        <KpiCard label="Total de Projetos" value={String(summary?.total ?? "—")} icon={Layers} />
        <KpiCard label="Em Execução" value={String(executingCount)} icon={Rocket} />
        <KpiCard label="Orçamento Total" value={summary ? formatCurrencyK(summary.totalBudgetK) : "—"} icon={Wallet} />
        <KpiCard label="VPL do Portfólio" value={summary ? formatCurrencyK(summary.totalVplK) : "—"} icon={TrendingUp} featured />
        <KpiCard
          label="Saúde do Portfólio"
          value={`${summary?.criticalCount ?? 0} crítico${(summary?.criticalCount ?? 0) === 1 ? "" : "s"}`}
          icon={OctagonAlert}
          featured={(summary?.criticalCount ?? 0) > 0}
          footer={
            summary && (
              <div className="border-t border-dashed border-border pt-3.5">
                <HealthDistribution onTrack={summary.onTrackCount} attention={summary.attentionCount} critical={summary.criticalCount} />
              </div>
            )
          }
        />
      </div>

      <Panel
        title="Todos os Projetos"
        subtitle={`~${summary?.total ?? 180} projetos do portfólio · busque, filtre e organize por tabela ou funil`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-md border border-border bg-app-alt p-0.5">
              <button
                onClick={() => setView("tabela")}
                className={`flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  view === "tabela" ? "bg-surface text-text shadow-token-sm" : "text-text-tertiary hover:text-text"
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                Tabela
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  view === "kanban" ? "bg-surface text-text shadow-token-sm" : "text-text-tertiary hover:text-text"
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                Funil
              </button>
            </div>
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-1.5 rounded-btn bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Novo Projeto
            </button>
          </div>
        }
      >
        <ProjectCatalog view={view} />
      </Panel>

      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
    </div>
  );
}
