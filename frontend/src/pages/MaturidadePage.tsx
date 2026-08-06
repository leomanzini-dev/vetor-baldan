import { useMemo } from "react";
import { Lightbulb, FlaskConical, Rocket } from "lucide-react";
import { useProjects } from "@/hooks/usePortfolio";
import { Panel } from "@/components/ui/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TrlDistributionChart } from "@/components/maturidade/TrlDistributionChart";
import { RoadmapChart } from "@/components/maturidade/RoadmapChart";
import { TrlScalePanel } from "@/components/maturidade/TrlScalePanel";
import { TrajectoryPanel } from "@/components/maturidade/TrajectoryPanel";
import { trlBands } from "@/config/trl";
import { bandCounts, computeRoadmapByYear, trlDistribution } from "@/lib/roadmap";

const bandIcons = { descoberta: Lightbulb, validacao: FlaskConical, escala: Rocket } as const;

export function MaturidadePage() {
  const { data } = useProjects({ limit: 200 });
  const projects = useMemo(() => data?.items ?? [], [data]);

  const distribution = useMemo(() => trlDistribution(projects), [projects]);
  const roadmap = useMemo(() => computeRoadmapByYear(projects), [projects]);
  const bands = useMemo(() => bandCounts(projects), [projects]);
  const currentYear = new Date().getFullYear();

  const dominantBand = trlBands.reduce((max, band) => (bands[band.id] > (bands[max.id] ?? 0) ? band : max), trlBands[0]);
  const dominantShare = projects.length ? Math.round((bands[dominantBand.id] / projects.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Maturidade &amp; Roadmap</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Eixo 2 — qual o grau de maturidade tecnológica de cada projeto e como ele evolui no tempo, numa
          escala TRL adaptada à metalomecânica agrícola da Baldan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {trlBands.map((band) => (
          <KpiCard
            key={band.id}
            label={band.label}
            value={String(bands[band.id] ?? 0)}
            icon={bandIcons[band.id]}
            featured={band.id === dominantBand.id}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Distribuição por Nível TRL" subtitle="Projetos classificados de 1 (princípio observado) a 9 (comprovado em operação)">
          <TrlDistributionChart data={distribution} />
        </Panel>

        <Panel
          title="Roadmap de Maturidade"
          subtitle={`Janela de ${roadmap[0]?.year ?? currentYear}–${roadmap[roadmap.length - 1]?.year ?? currentYear} · projetos ativos por ano e faixa`}
        >
          <RoadmapChart data={roadmap} currentYear={currentYear} />
          <p className="mt-3 text-[11.5px] leading-relaxed text-text-tertiary">
            {dominantShare}% do portfólio está na faixa <strong className="text-text-secondary">{dominantBand.label}</strong>{" "}
            (TRL {dominantBand.levels[0]}–{dominantBand.levels[1]}) — sinal de um portfólio concentrado nesse
            estágio de maturação.
          </p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Escala TRL da Baldan" subtitle="Parametrizável — redefina o que cada nível significa e exige">
          <TrlScalePanel />
        </Panel>

        <Panel title="Projetos em Trajetória" subtitle="Como estão e para onde caminham — próximos marcos de maturidade">
          <TrajectoryPanel projects={projects} />
        </Panel>
      </div>
    </div>
  );
}
