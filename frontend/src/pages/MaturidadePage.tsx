import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, FlaskConical, Rocket, Filter, Map, CalendarRange, TrendingUp, Wallet, PiggyBank, Gauge, ArrowRight } from "lucide-react";
import { useProjects, usePeople } from "@/hooks/usePortfolio";
import { useTrlStore } from "@/store/trlStore";
import { Panel } from "@/components/ui/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MaturityFunnelChart } from "@/components/maturidade/MaturityFunnelChart";
import { TrlLevelProjectsModal } from "@/components/maturidade/TrlLevelProjectsModal";
import { MaturityStreamChart } from "@/components/maturidade/MaturityStreamChart";
import { CapexEvolutionChart } from "@/components/maturidade/CapexEvolutionChart";
import { InvestmentByVerticalChart } from "@/components/maturidade/InvestmentByVerticalChart";
import { TopVplChart } from "@/components/maturidade/TopVplChart";
import { PortfolioRoadmapTable } from "@/components/maturidade/PortfolioRoadmapTable";
import { ProjectRoadmapModal } from "@/components/maturidade/ProjectRoadmapModal";
import { TrlScaleLadder } from "@/components/maturidade/TrlScaleLadder";
import { TrajectoryPanel } from "@/components/maturidade/TrajectoryPanel";
import { trlBands } from "@/config/trl";
import { formatCurrencyK } from "@/lib/format";
import {
  bandCounts,
  capexByVertical,
  computeRoadmapByYear,
  cumulativeCapexByYear,
  trlDistribution,
} from "@/lib/roadmap";

const bandIcons = { descoberta: Lightbulb, validacao: FlaskConical, escala: Rocket } as const;

type Tab = "funil" | "roadmap";

const tabs: { id: Tab; label: string; icon: typeof Filter }[] = [
  { id: "funil", label: "Funil", icon: Filter },
  { id: "roadmap", label: "Roadmap", icon: Map },
];

export function MaturidadePage() {
  const { data } = useProjects({ limit: 200 });
  const projects = useMemo(() => data?.items ?? [], [data]);
  const { data: people } = usePeople();
  const [tab, setTab] = useState<Tab>("funil");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const trlLevels = useTrlStore((s) => s.levels);

  const distribution = useMemo(() => trlDistribution(projects), [projects]);
  const roadmap = useMemo(() => computeRoadmapByYear(projects), [projects]);
  const bands = useMemo(() => bandCounts(projects), [projects]);
  const currentYear = new Date().getFullYear();

  const dominantBand = trlBands.reduce((max, band) => (bands[band.id] > (bands[max.id] ?? 0) ? band : max), trlBands[0]);
  const dominantShare = projects.length ? Math.round((bands[dominantBand.id] / projects.length) * 100) : 0;

  const peakYear = useMemo(
    () => roadmap.reduce((max, y) => (y.descoberta + y.validacao + y.escala > (max?.total ?? -1) ? { year: y.year, total: y.descoberta + y.validacao + y.escala } : max), null as { year: number; total: number } | null),
    [roadmap]
  );
  const headingToEscala = useMemo(
    () => projects.filter((p) => p.trl >= 7 && p.funnelStage !== "encerrado").length,
    [projects]
  );

  const capexEvolution = useMemo(() => cumulativeCapexByYear(projects), [projects]);
  const capexByVerticalData = useMemo(() => capexByVertical(projects), [projects]);
  const topVplProjects = useMemo(() => [...projects].sort((a, b) => b.vplValueK - a.vplValueK).slice(0, 10), [projects]);

  const capexTotal = useMemo(() => projects.reduce((sum, p) => sum + p.budgetK, 0), [projects]);
  const realizadoTotal = useMemo(() => projects.reduce((sum, p) => sum + p.spentK, 0), [projects]);
  const vplTotal = useMemo(() => projects.reduce((sum, p) => sum + p.vplValueK, 0), [projects]);
  const realizadoPct = capexTotal > 0 ? (realizadoTotal / capexTotal) * 100 : 0;
  const retornoMedio = capexTotal > 0 ? vplTotal / capexTotal : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Maturidade &amp; Roadmap</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Eixo 2 — qual o grau de maturidade tecnológica de cada projeto e como ele evolui no tempo, numa
          escala TRL adaptada à metalomecânica agrícola da Baldan.
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

      {tab === "funil" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {trlBands.map((band) => (
              <KpiCard
                key={band.id}
                label={`${band.label} · TRL ${band.levels[0]}–${band.levels[1]}`}
                value={String(bands[band.id] ?? 0)}
                icon={bandIcons[band.id]}
                featured={band.id === dominantBand.id}
              />
            ))}
          </div>

          <Panel
            title="Funil de Maturidade"
            subtitle="TRL 1 (mais largo, ideias em observação) até TRL 9 (mais fino, comprovado em operação) · clique num nível para ver os projetos"
          >
            <MaturityFunnelChart data={distribution} onSelectLevel={setSelectedLevel} />
          </Panel>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))] gap-5">
            <Panel
              title="Escala TRL da Baldan"
              subtitle="A escada de maturidade — clique num degrau para explorar"
              action={
                <Link
                  to="/parametrizacao?tab=maturidade"
                  className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary-hover"
                >
                  Editar escala <ArrowRight className="h-3 w-3" />
                </Link>
              }
            >
              <TrlScaleLadder projects={projects} />
            </Panel>

            <Panel title="Projetos em Trajetória" subtitle="Como estão e para onde caminham — próximos marcos de maturidade">
              <TrajectoryPanel projects={projects} />
            </Panel>
          </div>
        </div>
      )}

      {tab === "roadmap" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <KpiCard label="CAPEX Total" value={formatCurrencyK(capexTotal)} icon={Wallet} />
            <KpiCard
              label="Realizado"
              value={formatCurrencyK(realizadoTotal)}
              icon={PiggyBank}
              meta={[{ label: "% do CAPEX", value: `${realizadoPct.toFixed(0)}%` }]}
            />
            <KpiCard label="ROI Potencial (VPL)" value={formatCurrencyK(vplTotal)} icon={TrendingUp} featured />
            <KpiCard label="Retorno Médio" value={`${retornoMedio.toFixed(2)}x`} icon={Gauge} />
            <KpiCard
              label="Janela do roadmap"
              value={`${roadmap[0]?.year ?? currentYear}–${roadmap[roadmap.length - 1]?.year ?? currentYear}`}
              icon={CalendarRange}
            />
            <KpiCard
              label="Pico de atividade"
              value={peakYear ? String(peakYear.year) : "—"}
              icon={Rocket}
              meta={peakYear ? [{ label: "Projetos combinados", value: String(peakYear.total) }] : undefined}
            />
          </div>

          <Panel
            title="Roadmap do Portfólio"
            subtitle="Projeção automática de maturidade (TRL) ao longo dos próximos 5 anos, por projeto · clique numa linha para ver os detalhes"
          >
            <PortfolioRoadmapTable projects={projects} people={people ?? []} onSelectProject={setSelectedProjectId} />
          </Panel>

          <Panel
            title="Evolução da Maturidade no Tempo"
            subtitle={`Janela de ${roadmap[0]?.year ?? currentYear}–${roadmap[roadmap.length - 1]?.year ?? currentYear} · projetos ativos por ano e faixa, linha tracejada marca o ano corrente`}
          >
            <MaturityStreamChart data={roadmap} currentYear={currentYear} />
            <p className="mt-3 text-[11.5px] leading-relaxed text-text-tertiary">
              {dominantShare}% do portfólio está na faixa <strong className="text-text-secondary">{dominantBand.label}</strong>{" "}
              (TRL {dominantBand.levels[0]}–{dominantBand.levels[1]}) — sinal de um portfólio concentrado nesse
              estágio de maturação. {headingToEscala} projetos seguem rumo à faixa de Escala (TRL 7–9).
            </p>
          </Panel>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))] gap-5">
            <Panel title="Evolução Anual do CAPEX" subtitle="Investimento comprometido acumulado — soma do orçamento dos projetos já iniciados">
              <CapexEvolutionChart data={capexEvolution} />
            </Panel>

            <Panel title="Investimento por Vertical" subtitle="CAPEX total distribuído nos 4 P's">
              <InvestmentByVerticalChart data={capexByVerticalData} />
            </Panel>
          </div>

          <Panel title="Retorno Previsto — Top 10 Projetos" subtitle="Maior VPL do portfólio">
            <TopVplChart projects={topVplProjects} />
          </Panel>
        </div>
      )}

      {selectedLevel !== null && (
        <TrlLevelProjectsModal
          level={selectedLevel}
          def={trlLevels.find((l) => l.level === selectedLevel)}
          projects={projects.filter((p) => p.trl === selectedLevel)}
          people={people ?? []}
          onClose={() => setSelectedLevel(null)}
        />
      )}

      {selectedProjectId &&
        (() => {
          const project = projects.find((p) => p.id === selectedProjectId);
          if (!project) return null;
          return (
            <ProjectRoadmapModal
              project={project}
              leader={people?.find((p) => p.id === project.leaderId)}
              sponsor={people?.find((p) => p.id === project.sponsorId)}
              onClose={() => setSelectedProjectId(null)}
            />
          );
        })()}
    </div>
  );
}
