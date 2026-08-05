import { useEffect, useMemo, useRef, useState } from "react";
import {
  SlidersHorizontal,
  ListOrdered,
  Sparkles,
  PieChart as PieChartIcon,
  ArrowUpDown,
  Tag,
  Gauge,
  Trophy,
  Target,
} from "lucide-react";
import { useProjects } from "@/hooks/usePortfolio";
import { useWeightsStore } from "@/store/weightsStore";
import { useAllLenses } from "@/hooks/useLenses";
import { rankProjects } from "@/lib/priority";
import { computePriorityBands, computeScoreHistogram } from "@/lib/rankingStats";
import { defaultWeights, lensDefs } from "@/config/lenses";
import { Panel } from "@/components/ui/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WeightsPanel } from "@/components/priorizacao/WeightsPanel";
import { LensWeightDonut } from "@/components/priorizacao/LensWeightDonut";
import { LiveRankingPanel } from "@/components/priorizacao/LiveRankingPanel";
import { ScoreHistogramChart } from "@/components/priorizacao/ScoreHistogramChart";
import { PriorityBandsChart } from "@/components/priorizacao/PriorityBandsChart";
import { RankingTable } from "@/components/priorizacao/RankingTable";
import { ExplainabilityPanel } from "@/components/priorizacao/ExplainabilityPanel";

type Tab = "lentes" | "ranking" | "analise";

const tabs: { id: Tab; label: string; icon: typeof SlidersHorizontal }[] = [
  { id: "lentes", label: "Lentes & Pesos", icon: SlidersHorizontal },
  { id: "ranking", label: "Ranking", icon: ListOrdered },
  { id: "analise", label: "Análise IA", icon: Sparkles },
];

export function PriorizacaoPage() {
  const { data } = useProjects({ limit: 200 });
  const weights = useWeightsStore((s) => s.weights);
  const allLenses = useAllLenses();
  const [tab, setTab] = useState<Tab>("lentes");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ranked = useMemo(
    () => (data ? rankProjects(data.items, weights, allLenses) : []),
    [data, weights, allLenses]
  );

  useEffect(() => {
    if (!selectedId && ranked.length > 0) setSelectedId(ranked[0].project.id);
  }, [ranked, selectedId]);

  const selectedIndex = ranked.findIndex((s) => s.project.id === selectedId);
  const selected = selectedIndex >= 0 ? ranked[selectedIndex] : null;

  // Quanto cada projeto subiu/desceu no ranking desde o último ajuste de peso —
  // alimenta o badge de variação e o flash de animação do Top 10 ao vivo.
  const [rankDeltas, setRankDeltas] = useState<Record<string, number>>({});
  const [rankVersion, setRankVersion] = useState(0);
  const prevRanksRef = useRef<Record<string, number> | null>(null);

  useEffect(() => {
    const newRanks: Record<string, number> = {};
    ranked.forEach((s, i) => {
      newRanks[s.project.id] = i + 1;
    });

    const prev = prevRanksRef.current;
    if (prev) {
      const deltas: Record<string, number> = {};
      for (const id in newRanks) {
        const prevRank = prev[id];
        deltas[id] = prevRank !== undefined ? prevRank - newRanks[id] : 0;
      }
      setRankDeltas(deltas);
      setRankVersion((v) => v + 1);
    }
    prevRanksRef.current = newRanks;
  }, [ranked]);

  // Cards da aba "Lentes & Pesos" — quantidade, peso total configurado, lente
  // dominante e o maior desvio em relação ao Padrão Baldan vigente (que pode
  // já ter sido redefinido em Parametrização — não é mais o valor de fábrica).
  const customLenses = useWeightsStore((s) => s.customLenses);
  const presetWeights = useWeightsStore((s) => s.presetWeights);
  const baselineWeights = presetWeights.padrao ?? defaultWeights;
  const lensStats = useMemo(() => {
    const totalWeight = allLenses.reduce((sum, l) => sum + (weights[l.id] ?? 0), 0);
    const dominant = allLenses.reduce(
      (top, l) => ((weights[l.id] ?? 0) > (weights[top.id] ?? 0) ? l : top),
      allLenses[0]
    );
    const deviations = lensDefs.map((l) => ({
      lens: l,
      diff: (weights[l.id] ?? 0) - (baselineWeights[l.id] ?? 0),
    }));
    const biggestDeviation = deviations.reduce(
      (top, d) => (Math.abs(d.diff) > Math.abs(top.diff) ? d : top),
      deviations[0] ?? { lens: lensDefs[0], diff: 0 }
    );
    return { totalWeight, dominant, biggestDeviation };
  }, [allLenses, weights, baselineWeights]);

  // Cards + gráficos da aba "Ranking" — bandas por quartil e distribuição de scores.
  const priorityBands = useMemo(() => computePriorityBands(ranked), [ranked]);
  const scoreHistogram = useMemo(() => computeScoreHistogram(ranked), [ranked]);
  const avgScore = ranked.length ? ranked.reduce((sum, s) => sum + s.total, 0) / ranked.length : 0;
  const leader = ranked[0];
  const prioritarioBand = priorityBands.find((b) => b.id === "prioritario");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Priorização Multicritério</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Eixo 1 — quais projetos merecem mais atenção e recursos, e por quê. Ajuste os pesos e veja o
          portfólio inteiro se reordenar em tempo real.
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

      {tab === "lentes" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard
              label="Lentes ativas"
              value={String(allLenses.length)}
              icon={SlidersHorizontal}
              meta={[
                { label: "Fixas", value: String(lensDefs.length) },
                { label: "Personalizadas", value: String(customLenses.length) },
              ]}
            />
            <KpiCard
              label="Peso total configurado"
              value={`${lensStats.totalWeight}%`}
              icon={PieChartIcon}
              meta={[{ label: "Base de referência", value: "100%" }]}
            />
            <KpiCard
              label="Lente dominante"
              value={lensStats.dominant.short}
              icon={lensStats.dominant.icon}
              featured
              meta={[{ label: "Peso atual", value: `${weights[lensStats.dominant.id] ?? 0}%` }]}
            />
            <KpiCard
              label="Maior desvio do padrão"
              value={lensStats.biggestDeviation.lens.short}
              icon={ArrowUpDown}
              meta={[
                {
                  label: lensStats.biggestDeviation.diff >= 0 ? "Acima do padrão" : "Abaixo do padrão",
                  value: `${lensStats.biggestDeviation.diff > 0 ? "+" : ""}${lensStats.biggestDeviation.diff}pp`,
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[7fr_3fr]">
            <WeightsPanel />
            <div className="flex flex-col gap-5">
              <div className="rounded-card border border-border bg-surface p-5 shadow-token-sm">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-alt text-text-secondary">
                    <Tag className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-text">Distribuição de Pesos</h3>
                    <p className="text-[11px] text-text-tertiary">% configurado por lente</p>
                  </div>
                </div>
                <LensWeightDonut lenses={allLenses} weights={weights} />
              </div>
              <LiveRankingPanel
                top={ranked.slice(0, 10)}
                deltas={rankDeltas}
                version={rankVersion}
                onViewFull={() => setTab("ranking")}
              />
            </div>
          </div>
        </div>
      )}

      {tab === "ranking" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Projetos no ranking" value={String(ranked.length)} icon={ListOrdered} />
            <KpiCard label="Score médio" value={avgScore.toFixed(1)} icon={Gauge} />
            <KpiCard
              label="Líder do ranking"
              value={leader ? leader.total.toFixed(1) : "—"}
              icon={Trophy}
              featured
              meta={leader ? [{ label: "Projeto", value: leader.project.code }] : undefined}
            />
            <KpiCard
              label="Faixa Prioritário"
              value={String(prioritarioBand?.count ?? 0)}
              icon={Target}
              meta={prioritarioBand ? [{ label: "Corte", value: `≥ ${prioritarioBand.minScore.toFixed(0)} pts` }] : undefined}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-card border border-border bg-surface p-5 shadow-token-sm">
              <h3 className="text-[13px] font-semibold text-text">Distribuição de Scores</h3>
              <p className="mb-2 text-[11px] text-text-tertiary">Como o portfólio se espalha na escala calculada</p>
              <ScoreHistogramChart buckets={scoreHistogram} />
            </div>
            <div className="rounded-card border border-border bg-surface p-5 shadow-token-sm">
              <h3 className="text-[13px] font-semibold text-text">Composição por Faixa</h3>
              <p className="mb-4 text-[11px] text-text-tertiary">Quartis do ranking com os pesos atuais</p>
              <PriorityBandsChart bands={priorityBands} />
            </div>
          </div>

          <Panel title="Ranking do Portfólio" subtitle="Recalculado com os pesos atuais">
            <RankingTable scored={ranked} selectedId={selectedId} onSelect={setSelectedId} />
          </Panel>
        </div>
      )}

      {tab === "analise" && (
        <Panel title="Por que esta posição?" subtitle="Explicabilidade do resultado, com apoio de IA">
          {selected ? (
            <ExplainabilityPanel scored={selected} rank={selectedIndex + 1} totalCount={ranked.length} />
          ) : (
            <p className="py-8 text-center text-[13px] text-text-tertiary">Selecione um projeto no ranking.</p>
          )}
        </Panel>
      )}
    </div>
  );
}
