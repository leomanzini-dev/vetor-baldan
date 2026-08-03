import { useEffect, useMemo, useState } from "react";
import { useProjects } from "@/hooks/usePortfolio";
import { useWeightsStore } from "@/store/weightsStore";
import { rankProjects } from "@/lib/priority";
import { Panel } from "@/components/ui/Panel";
import { WeightsPanel } from "@/components/priorizacao/WeightsPanel";
import { RankingTable } from "@/components/priorizacao/RankingTable";
import { ExplainabilityPanel } from "@/components/priorizacao/ExplainabilityPanel";

export function PriorizacaoPage() {
  const { data } = useProjects({ limit: 200 });
  const weights = useWeightsStore((s) => s.weights);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ranked = useMemo(() => (data ? rankProjects(data.items, weights) : []), [data, weights]);

  useEffect(() => {
    if (!selectedId && ranked.length > 0) setSelectedId(ranked[0].project.id);
  }, [ranked, selectedId]);

  const selectedIndex = ranked.findIndex((s) => s.project.id === selectedId);
  const selected = selectedIndex >= 0 ? ranked[selectedIndex] : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Priorização Multicritério</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Eixo 1 — quais projetos merecem mais atenção e recursos, e por quê. Ajuste os pesos e veja o
          portfólio inteiro se reordenar em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Lentes & Pesos" subtitle="Totalmente parametrizável — os pesos não precisam somar 100">
          <WeightsPanel />
        </Panel>

        <Panel title="Ranking do Portfólio" subtitle="Recalculado com os pesos atuais">
          <RankingTable scored={ranked} selectedId={selectedId} onSelect={setSelectedId} />
        </Panel>

        <Panel title="Por que esta posição?" subtitle="Explicabilidade do resultado, com apoio de IA">
          {selected ? (
            <ExplainabilityPanel scored={selected} rank={selectedIndex + 1} totalCount={ranked.length} />
          ) : (
            <p className="py-8 text-center text-[13px] text-text-tertiary">Selecione um projeto no ranking.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
