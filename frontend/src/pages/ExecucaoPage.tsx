import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Layers, BarChart3, ListChecks, ArrowRight, Users, FolderKanban, Radar } from "lucide-react";
import { useExecutingProjects, useMonthlyTrend, usePeople } from "@/hooks/usePortfolio";
import { useMergedCapacitySummary, useMergedExecutionDetail } from "@/hooks/useExecutionData";
import { Panel } from "@/components/ui/Panel";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { ExecutionProjectPicker } from "@/components/execucao/ExecutionProjectPicker";
import { SCurveChart } from "@/components/execucao/SCurveChart";
import { StatusReportCard } from "@/components/execucao/StatusReportCard";
import { ProjectStructureTree } from "@/components/execucao/ProjectStructureTree";
import { CapacityBoard } from "@/components/execucao/CapacityBoard";
import { ProjectAllocationPanel } from "@/components/execucao/ProjectAllocationPanel";
import { ExecutionTrendChart } from "@/components/execucao/ExecutionTrendChart";
import { ProjectDetailPanel } from "@/components/execucao/ProjectDetailPanel";
import { ResourceRequestsPanel } from "@/components/execucao/ResourceRequestsPanel";
import { ProjectAnalysisPanel } from "@/components/execucao/ProjectAnalysisPanel";

type Tab = "geral" | "estrutura" | "analise" | "analise-projetos";

const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "geral", label: "Visão Geral", icon: LayoutGrid },
  { id: "estrutura", label: "Estrutura & Camadas", icon: Layers },
  { id: "analise", label: "Análise Execução", icon: BarChart3 },
  { id: "analise-projetos", label: "Análise de Projetos", icon: Radar },
];

export function ExecucaoPage() {
  const { data: projects } = useExecutingProjects();
  const { data: people } = usePeople();
  const { data: capacity } = useMergedCapacitySummary();
  const { data: monthlyTrend } = useMonthlyTrend();
  const [tab, setTab] = useState<Tab>("geral");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAllocationProjectId, setSelectedAllocationProjectId] = useState<string | null>(null);

  // "Em andamento" = ainda não atingiu o topo da escala de maturidade — ao
  // chegar em TRL 9 o projeto está concluído e sai da análise de execução.
  const executing = useMemo(
    () => projects?.filter((p) => p.funnelStage === "execucao" && p.trl < 9) ?? [],
    [projects]
  );

  useEffect(() => {
    if (!selectedId && executing.length > 0) {
      const critical = executing.find((p) => p.health === "critical");
      setSelectedId((critical ?? executing[0]).id);
    }
  }, [executing, selectedId]);

  const { data: detail } = useMergedExecutionDetail(selectedId);
  const selectedProject = executing.find((p) => p.id === selectedId);

  const projectsById = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p])), [projects]);
  const executingById = useMemo(() => new Map(executing.map((p) => [p.id, p])), [executing]);
  const peopleById = useMemo(() => new Map((people ?? []).map((p) => [p.id, p])), [people]);

  const allocatedPeopleCount = useMemo(
    () => (capacity ? capacity.summary.filter((s) => s.microStages.length > 0).length : 0),
    [capacity]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Execução Ponta a Ponta</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Eixo 3 — como cada projeto está sendo executado no dia a dia: cronograma, curva-S, status report e a
          análise de execução da equipe.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border [scrollbar-width:none]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                active ? "border-primary text-primary" : "border-transparent text-text-tertiary hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "geral" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Panel title="Projetos em Execução" subtitle={`${executing.length} projetos ativos`} className="lg:col-span-1">
            <ExecutionProjectPicker projects={executing} selectedId={selectedId} onSelect={setSelectedId} />
          </Panel>

          <div className="flex flex-col gap-5 lg:col-span-2">
            {selectedProject && (
              <Panel
                title={selectedProject.name}
                subtitle={selectedProject.code}
                action={
                  <div className="flex items-center gap-2">
                    <VerticalBadge vertical={selectedProject.vertical} />
                    <HealthBadge health={selectedProject.health} />
                  </div>
                }
              >
                {detail ? <SCurveChart data={detail.scurve} /> : <ChartSkeleton />}
              </Panel>
            )}
            <Panel title="Status Report" subtitle="Snapshot do período corrente">
              {detail ? <StatusReportCard report={detail.statusReport} /> : <Skeleton />}
            </Panel>
          </div>
        </div>
      )}

      {tab === "estrutura" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Panel title="Projetos em Execução" subtitle="Selecione para ver a estrutura" className="lg:col-span-1">
            <ExecutionProjectPicker projects={executing} selectedId={selectedId} onSelect={setSelectedId} />
          </Panel>
          <Panel
            title="Níveis de Maturidade (TRL) → Micro-etapas"
            subtitle={selectedProject ? `${selectedProject.code} · ${selectedProject.name} · TRL atual ${selectedProject.trl}` : undefined}
            className="lg:col-span-2"
          >
            {detail && people ? (
              <ProjectStructureTree phases={detail.phases} microStages={detail.microStages} people={people} />
            ) : (
              <Skeleton />
            )}
          </Panel>
        </div>
      )}

      {tab === "analise" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-card border border-primary-soft bg-primary-soft/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13.5px] font-semibold text-text">
                Os dados abaixo vêm das rotinas diárias registradas em Minhas Tarefas
              </p>
              <p className="mt-0.5 text-[12px] text-text-tertiary">
                Cada responsável conclui suas micro-etapas por lá, gerando pontos e horas de atividade que alimentam esta análise.
              </p>
            </div>
            <Link
              to="/colaborador"
              className="flex shrink-0 items-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-[12.5px] font-bold text-on-primary transition-colors hover:bg-primary/90"
            >
              <ListChecks className="h-4 w-4" />
              Minhas Tarefas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <div className="rounded-card border border-border bg-surface px-4 py-3.5 shadow-token-sm">
              <div className="flex items-center gap-2 text-text-tertiary">
                <FolderKanban className="h-3.5 w-3.5" />
                <p className="text-[10.5px] font-bold uppercase tracking-wide">Projetos em execução</p>
              </div>
              <p className="mt-1.5 text-[24px] font-bold leading-none text-text">{executing.length}</p>
            </div>
            <div className="rounded-card border border-border bg-surface px-4 py-3.5 shadow-token-sm">
              <div className="flex items-center gap-2 text-text-tertiary">
                <Users className="h-3.5 w-3.5" />
                <p className="text-[10.5px] font-bold uppercase tracking-wide">Pessoas alocadas</p>
              </div>
              <p className="mt-1.5 text-[24px] font-bold leading-none text-text">{allocatedPeopleCount}</p>
            </div>
            <div className="rounded-card border border-border bg-surface px-4 py-3.5 shadow-token-sm">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">Pontos entregues no mês</p>
              <p className="mt-1.5 text-[24px] font-bold leading-none text-primary">
                {capacity ? capacity.summary.reduce((sum, s) => sum + s.pointsEarned, 0) : "—"}
              </p>
            </div>
            <div className="rounded-card border border-border bg-surface px-4 py-3.5 shadow-token-sm">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">Pontos comprometidos</p>
              <p className="mt-1.5 text-[24px] font-bold leading-none text-text">
                {capacity ? capacity.summary.reduce((sum, s) => sum + s.pointsCommitted, 0) : "—"}
              </p>
            </div>
          </div>

          <Panel
            title="Solicitações de Reforço"
            subtitle="Pedidos de apoio enviados pelos responsáveis em Minhas Tarefas"
          >
            <ResourceRequestsPanel projectsById={executingById} peopleById={peopleById} />
          </Panel>

          <Panel
            title="Tendência de Execução"
            subtitle="Pontos previstos x entregues por mês e taxa de conclusão — últimos 6 meses"
          >
            {monthlyTrend ? <ExecutionTrendChart data={monthlyTrend} /> : <ChartSkeleton />}
          </Panel>

          <Panel
            title="Capacidade da Equipe"
            subtitle={
              capacity ? `${capacity.currentMonth} · hora convertida em ponto, meta mensal por pessoa conforme horas de trabalho` : undefined
            }
          >
            {capacity ? <CapacityBoard summary={capacity.summary} projectsById={projectsById} /> : <Skeleton />}
          </Panel>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel
              title="Alocação por Projeto"
              subtitle="Responsável, TRL atual e pontos entregues x esperados — sinaliza sobrecarga ou baixa produtividade"
            >
              {capacity ? (
                <ProjectAllocationPanel
                  summary={capacity.summary}
                  projectsById={executingById}
                  selectedProjectId={selectedAllocationProjectId}
                  onSelectProject={setSelectedAllocationProjectId}
                />
              ) : (
                <Skeleton />
              )}
            </Panel>
            <Panel
              title="Detalhamento de Projeto"
              subtitle="Clique num projeto em Alocação por Projeto para ver tudo sobre ele aqui"
            >
              {capacity ? (
                <ProjectDetailPanel
                  project={selectedAllocationProjectId ? executingById.get(selectedAllocationProjectId) ?? null : null}
                  peopleById={peopleById}
                  summary={capacity.summary}
                />
              ) : (
                <Skeleton />
              )}
            </Panel>
          </div>
        </div>
      )}

      {tab === "analise-projetos" && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-[15px] font-semibold text-text">Análise de Projetos</h2>
            <p className="mt-0.5 text-[12.5px] text-text-tertiary">
              Saúde de cada projeto em execução, por que está assim (indicadores internos) e hipóteses de fatores
              externos que podem estar pressionando o resultado.
            </p>
          </div>
          <ProjectAnalysisPanel projects={executing} />
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return <div className="h-40 animate-pulse rounded-md bg-app-alt" />;
}

function ChartSkeleton() {
  return <div className="h-[260px] animate-pulse rounded-md bg-app-alt" />;
}
