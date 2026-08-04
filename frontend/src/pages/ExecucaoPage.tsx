import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Layers, Users } from "lucide-react";
import {
  useCapacitySummary,
  useExecutingProjects,
  useExecutionDetail,
  usePeople,
} from "@/hooks/usePortfolio";
import { Panel } from "@/components/ui/Panel";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { ExecutionProjectPicker } from "@/components/execucao/ExecutionProjectPicker";
import { SCurveChart } from "@/components/execucao/SCurveChart";
import { StatusReportCard } from "@/components/execucao/StatusReportCard";
import { ProjectStructureTree } from "@/components/execucao/ProjectStructureTree";
import { CapacityBoard } from "@/components/execucao/CapacityBoard";

type Tab = "geral" | "estrutura" | "pontos";

const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "geral", label: "Visão Geral", icon: LayoutGrid },
  { id: "estrutura", label: "Estrutura & Camadas", icon: Layers },
  { id: "pontos", label: "Pontos por Capacidade", icon: Users },
];

export function ExecucaoPage() {
  const { data: projects } = useExecutingProjects();
  const { data: people } = usePeople();
  const { data: capacity } = useCapacitySummary();
  const [tab, setTab] = useState<Tab>("geral");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const executing = useMemo(() => projects?.filter((p) => p.funnelStage === "execucao") ?? [], [projects]);

  useEffect(() => {
    if (!selectedId && executing.length > 0) {
      const critical = executing.find((p) => p.health === "critical");
      setSelectedId((critical ?? executing[0]).id);
    }
  }, [executing, selectedId]);

  const { data: detail } = useExecutionDetail(selectedId);
  const selectedProject = executing.find((p) => p.id === selectedId);

  const projectsById = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p])), [projects]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Execução Ponta a Ponta</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Eixo 3 — como cada projeto está sendo executado no dia a dia: cronograma, curva-S, status report e o
          sistema de pontos por capacidade.
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
            title="Tipo → Fases → Etapas → Micro-etapas"
            subtitle={selectedProject ? `${selectedProject.code} · ${selectedProject.name}` : undefined}
            className="lg:col-span-2"
          >
            {detail && people ? (
              <ProjectStructureTree
                phases={detail.phases}
                stages={detail.stages}
                microStages={detail.microStages}
                people={people}
              />
            ) : (
              <Skeleton />
            )}
          </Panel>
        </div>
      )}

      {tab === "pontos" && (
        <Panel
          title="Capacidade da Equipe"
          subtitle={
            capacity ? `${capacity.currentMonth} · hora convertida em ponto, meta mensal por pessoa conforme horas de trabalho` : undefined
          }
        >
          {capacity ? <CapacityBoard summary={capacity.summary} projectsById={projectsById} /> : <Skeleton />}
        </Panel>
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
