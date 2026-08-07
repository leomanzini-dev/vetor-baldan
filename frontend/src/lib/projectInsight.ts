import { lensDefs } from "@/config/lenses";
import { parseLocalDate } from "@/lib/format";
import type { Project, ProjectScores } from "@/types/domain";

const scoreKeys: (keyof ProjectScores)[] = [
  "financeiro",
  "mercado",
  "riscoTecnologico",
  "aderenciaEstrategica",
  "regulatorio",
  "esg",
  "operacional",
  "complexidadeIndustrial",
];

function lensLabel(key: keyof ProjectScores): string {
  return lensDefs.find((l) => l.id === key)?.label ?? key;
}

export interface ScoreExtreme {
  key: keyof ProjectScores;
  label: string;
  score: number;
}

// Lente mais forte e mais fraca do projeto — mesma leitura usada no ranking
// (lib/explainability.ts), aqui aplicada a um projeto isolado fora do contexto
// de pesos, já que no funil de maturidade ainda não há uma priorização ativa.
export function strongestAndWeakestLens(scores: ProjectScores): { best: ScoreExtreme; worst: ScoreExtreme } {
  const entries: ScoreExtreme[] = scoreKeys.map((key) => ({ key, label: lensLabel(key), score: scores[key] }));
  const best = entries.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = entries.reduce((a, b) => (b.score < a.score ? b : a));
  return { best, worst };
}

export function daysSince(dateIso: string, now = new Date()): number {
  return Math.max(0, Math.round((now.getTime() - parseLocalDate(dateIso).getTime()) / 86_400_000));
}

export function formatDurationPtBr(days: number): string {
  if (days < 1) return "hoje";
  if (days < 30) return `${days} dia${days === 1 ? "" : "s"}`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "mês" : "meses"}`;
}

export interface FunnelDiagnosis {
  headline: string;
  detail: string;
}

// Diagnóstico sintetizado a partir dos próprios indicadores do projeto — para
// projetos que ainda não entraram em execução não há SPI/CPI/status report
// real (backend/src/data/generateExecution.ts só gera esses dados para
// projetos em execução/encerrados), então a leitura de "por que está assim"
// vem das 8 lentes de priorização e do tempo já decorrido no funil.
export function buildFunnelDiagnosis(project: Project): FunnelDiagnosis {
  const { best, worst } = strongestAndWeakestLens(project.scores);
  const pipelineDays = daysSince(project.startDate);

  const headline = `${formatDurationPtBr(pipelineDays)} no funil, ainda sem métricas de execução (SPI/CPI só existem a partir da execução).`;

  const detail =
    worst.key !== best.key
      ? `Ponto forte: ${best.label.toLowerCase()} (nota ${best.score}). Principal fragilidade: ${worst.label.toLowerCase()} (nota ${worst.score}) — é o critério que mais pesa contra o projeto na priorização atual.`
      : `Todas as lentes avaliadas de forma equilibrada, com destaque para ${best.label.toLowerCase()} (nota ${best.score}).`;

  return { headline, detail };
}
