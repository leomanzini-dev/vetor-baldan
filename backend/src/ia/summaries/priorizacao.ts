// Sumário: Priorização Multicritério

import { portfolioService } from "../../services/portfolioService.js";

export function buildPriorizacaoSummary(): string {
  const { items: projects } = portfolioService.getProjects({});

  const sorted = [...projects].sort((a, b) => b.priorityScoreDefault - a.priorityScoreDefault);
  const total = sorted.length;
  const avgScore = total ? sorted.reduce((s, p) => s + p.priorityScoreDefault, 0) / total : 0;

  const q1 = Math.ceil(total * 0.25);
  const q2 = Math.ceil(total * 0.5);
  const q3 = Math.ceil(total * 0.75);

  const bands = [
    { label: "Prioritário", items: sorted.slice(0, q1) },
    { label: "Alto", items: sorted.slice(q1, q2) },
    { label: "Médio", items: sorted.slice(q2, q3) },
    { label: "Baixo", items: sorted.slice(q3) },
  ];

  const lensLabels: Record<string, string> = {
    financeiro: "Impacto Financeiro",
    mercado: "Potencial de Mercado",
    riscoTecnologico: "Risco Tecnológico",
    aderenciaEstrategica: "Aderência Estratégica",
    regulatorio: "Regulatório",
    esg: "ESG",
    operacional: "Viabilidade Operacional",
    complexidadeIndustrial: "Complexidade Industrial",
  };

  const lines: string[] = [
    "#-# PRIORIZACAO MULTICRITERIO",
    "",
    `Total ranqueado: ${total}`,
    `Score médio: ${avgScore.toFixed(1)}`,
    `Líder: ${sorted[0]?.code} - ${sorted[0]?.name} (${sorted[0]?.priorityScoreDefault.toFixed(1)} pts)`,
    "",
    "#-# FAIXAS DE PRIORIDADE",
  ];

  for (const band of bands) {
    const min = band.items.at(-1)?.priorityScoreDefault ?? 0;
    const max = band.items[0]?.priorityScoreDefault ?? 0;
    lines.push(`  ${band.label}: ${band.items.length} projetos (${min.toFixed(0)}-${max.toFixed(0)} pts)`);
  }

  lines.push("", "#-# TOP 10 RANKING (pesos padrao)");
  for (let i = 0; i < Math.min(10, sorted.length); i++) {
    const p = sorted[i];
    lines.push(`  #${i + 1} ${p.code} - ${p.name} — ${p.priorityScoreDefault.toFixed(1)} pts`);
  }

  lines.push("", "#-# 8 LENTES DE AVALIACAO (media geral do portfolio)");
  const lensKeys = Object.keys(lensLabels) as (keyof typeof lensLabels)[];
  for (const key of lensKeys) {
    const avg = projects.reduce((s, p) => s + ((p.scores as unknown as Record<string, number>)[key] ?? 0), 0) / (total || 1);
    lines.push(`  ${lensLabels[key]}: ${avg.toFixed(1)}/100`);
  }

  return lines.join("\n");
}
