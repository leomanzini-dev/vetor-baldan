import { lensDefs } from "@/config/lenses";
import { useWeightsStore } from "@/store/weightsStore";
import type { ScoredProject } from "@/lib/priority";

const lensLabel = (id: string) =>
  lensDefs.find((l) => l.id === id)?.label ??
  useWeightsStore.getState().customLenses.find((l) => l.id === id)?.label ??
  id;

export function buildRankExplanation(scored: ScoredProject, rank: number, totalCount: number): string {
  const { project, contributions } = scored;
  const top = contributions[0];
  const weakest = [...contributions].sort((a, b) => a.score - b.score)[0];
  const topSharePct = Math.round((top.contribution / (scored.total || 1)) * 100);

  const strengthClause = `o critério que mais pesou foi ${lensLabel(top.lens)} (nota ${top.score}, responsável por ${topSharePct}% da pontuação final)`;

  const weaknessClause =
    weakest.lens !== top.lens
      ? `, enquanto ${lensLabel(weakest.lens)} (nota ${weakest.score}) foi o que menos contribuiu na configuração atual`
      : "";

  return `${project.name} ocupa a posição ${rank} de ${totalCount} — ${strengthClause}${weaknessClause}.`;
}
