import type { CapacitySummary, FunnelStageId, Project, VerticalId } from "@/types/domain";
import { funnelStageLabels } from "@/config/chartPalette";
import { verticalNames } from "@/config/verticals";

export type AiSignalSeverity = "critical" | "attention" | "opportunity";

export interface AiSignal {
  id: string;
  message: string;
  severity: AiSignalSeverity;
  category: string;
}

const nonExecutionStages: FunnelStageId[] = ["captacao", "triagem", "avaliacao", "gate"];

// Texto sintetizado a partir dos próprios indicadores do projeto — simula a
// camada interpretativa de IA descrita no desafio (protótipo: sem modelo real).
export function buildProjectSignal(project: Project): AiSignal {
  const spi = project.spi ?? 1;
  const cpi = project.cpi ?? 1;
  const worseIsCost = cpi <= spi;

  if (worseIsCost) {
    const overrun = Math.round((1 - cpi) * 100);
    return {
      id: project.id,
      severity: cpi < 0.85 ? "critical" : "attention",
      category: "Execução",
      message: `${project.code} · ${project.name} — CPI em ${cpi.toFixed(2)} indica consumo ${overrun}% acima do ritmo orçado. Recomenda-se revisão de escopo no próximo gate.`,
    };
  }

  const delay = Math.round((1 - spi) * 100);
  return {
    id: project.id,
    severity: spi < 0.85 ? "critical" : "attention",
    category: "Execução",
    message: `${project.code} · ${project.name} — SPI em ${spi.toFixed(2)} aponta atraso de cronograma de ${delay}%. Sugerido replanejamento das micro-etapas remanescentes.`,
  };
}

export function buildFunnelSignal(byFunnelStage: { stage: FunnelStageId; count: number }[]): AiSignal | null {
  const early = byFunnelStage.filter((s) => s.stage === "captacao" || s.stage === "triagem");
  const earlyTotal = early.reduce((sum, s) => sum + s.count, 0);
  const total = byFunnelStage.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return null;
  const share = earlyTotal / total;
  if (share < 0.35) return null;

  return {
    id: "funnel-bottleneck",
    severity: "attention",
    category: "Funil",
    message: `${earlyTotal} projetos (${Math.round(share * 100)}% do portfólio) concentram-se em ${funnelStageLabels.captacao}/${funnelStageLabels.triagem} — sinal de gargalo na qualificação inicial do funil.`,
  };
}

// Concentração excessiva numa vertical reduz a diversificação do portfólio —
// sinal de risco estrutural, não de execução de um projeto específico.
export function buildVerticalConcentrationSignal(
  byVertical: { vertical: VerticalId; count: number }[],
  total: number
): AiSignal | null {
  if (total === 0) return null;
  const leader = [...byVertical].sort((a, b) => b.count - a.count)[0];
  if (!leader) return null;
  const share = leader.count / total;
  if (share < 0.45) return null;

  return {
    id: "vertical-concentration",
    severity: "attention",
    category: "Portfólio",
    message: `${verticalNames[leader.vertical]} concentra ${Math.round(share * 100)}% dos projetos ativos (${leader.count} de ${total}) — diversificar entre verticais reduz a exposição a um único mercado.`,
  };
}

// Sobrecarga de capacidade: executores comprometidos além da capacidade
// mensal disponível colocam prazos de execução em risco antes mesmo de o
// SPI/CPI do projeto acusar atraso.
export function buildCapacitySignal(capacity: CapacitySummary[]): AiSignal | null {
  const overloaded = capacity.filter((c) => c.monthlyCapacityPoints > 0 && c.pointsCommitted > c.monthlyCapacityPoints);
  if (overloaded.length === 0) return null;

  const worst = [...overloaded].sort(
    (a, b) => b.pointsCommitted / b.monthlyCapacityPoints - a.pointsCommitted / a.monthlyCapacityPoints
  )[0];
  const worstPct = Math.round((worst.pointsCommitted / worst.monthlyCapacityPoints) * 100);

  return {
    id: "capacity-overload",
    severity: overloaded.length >= 3 ? "critical" : "attention",
    category: "Capacidade",
    message: `${overloaded.length} ${overloaded.length === 1 ? "executor está" : "executores estão"} com pontos comprometidos acima da capacidade mensal — pior caso: ${worst.person.name.split(" ")[0]} em ${worstPct}% da capacidade. Risco de atraso em cascata nas micro-etapas do mês.`,
  };
}

// Oportunidade: o projeto mais bem ranqueado que ainda não chegou à execução
// é valor represado no funil — acelerar a passagem pelo gate captura esse
// resultado mais cedo, ao invés de deixá-lo esperar na fila.
export function buildOpportunitySignal(topPriority: Project[]): AiSignal | null {
  const candidate = topPriority.find((p) => nonExecutionStages.includes(p.funnelStage));
  if (!candidate) return null;

  return {
    id: `opportunity-${candidate.id}`,
    severity: "opportunity",
    category: "Oportunidade",
    message: `${candidate.code} · ${candidate.name} lidera o ranking de prioridade (score ${candidate.priorityScoreDefault.toFixed(1)}) mas segue em ${funnelStageLabels[candidate.funnelStage]} — acelerar sua passagem pelo funil antecipa o retorno já mapeado.`,
  };
}
