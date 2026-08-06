import type { FunnelStageId, Project } from "@/types/domain";
import { funnelStageLabels } from "@/config/chartPalette";

export interface AiSignal {
  id: string;
  message: string;
  severity: "critical" | "attention";
}

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
      message: `${project.code} · ${project.name} — CPI em ${cpi.toFixed(2)} indica consumo ${overrun}% acima do ritmo orçado. Recomenda-se revisão de escopo no próximo gate.`,
    };
  }

  const delay = Math.round((1 - spi) * 100);
  return {
    id: project.id,
    severity: spi < 0.85 ? "critical" : "attention",
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
    message: `${earlyTotal} projetos (${Math.round(share * 100)}% do portfólio) concentram-se em ${funnelStageLabels.captacao}/${funnelStageLabels.triagem} — sinal de gargalo na qualificação inicial do funil.`,
  };
}
