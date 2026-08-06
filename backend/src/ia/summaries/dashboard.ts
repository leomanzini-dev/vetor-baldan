// Sumário: Visão Geral do Portfólio (Dashboard)

import { portfolioService } from "../../services/portfolioService.js";

export function buildDashboardSummary(): string {
  const summary = portfolioService.getSummary();
  const highlights = portfolioService.getHighlights();
  const verticals = portfolioService.getVerticals();
  const funnelStages = portfolioService.getFunnelStages();

  const verticalNames: Record<string, string> = {};
  for (const v of verticals) verticalNames[v.id] = v.name;

  const funnelNames: Record<string, string> = {};
  for (const f of funnelStages) funnelNames[f.id] = f.name;

  const lines: string[] = [
    "#-# VISAO GERAL DO PORTFOLIO",
    "",
    `Total de projetos: ${summary.total}`,
    `TIR média: ${summary.avgTir}%`,
    `VPL total: R$ ${(summary.totalVplK * 1000).toLocaleString("pt-BR")}`,
    `Orçamento total: R$ ${(summary.totalBudgetK * 1000).toLocaleString("pt-BR")}`,
    `TRL médio: ${summary.avgTrl}`,
    `SPI médio (execução): ${summary.avgSpi}`,
    `CPI médio (execução): ${summary.avgCpi}`,
    "",
    "#-# SAUDE DA EXECUCAO",
    `No caminho (on-track): ${summary.onTrackCount}`,
    `Atenção: ${summary.attentionCount}`,
    `Críticos: ${summary.criticalCount}`,
    "",
    "#-# DISTRIBUICAO POR VERTICAL",
  ];

  for (const v of summary.byVertical) {
    lines.push(`  ${verticalNames[v.vertical] || v.vertical}: ${v.count} projetos`);
  }

  lines.push("", "#-# DISTRIBUICAO POR FUNIL");
  for (const f of summary.byFunnelStage) {
    lines.push(`  ${funnelNames[f.stage] || f.stage}: ${f.count} projetos`);
  }

  if (highlights.critical.length) {
    lines.push("", "#-# PROJETOS CRITICOS");
    for (const p of highlights.critical) {
      lines.push(`  ${p.code} - ${p.name} (${verticalNames[p.vertical]}) SPI=${p.spi} CPI=${p.cpi}`);
    }
  }

  if (highlights.topPriority.length) {
    lines.push("", "#-# TOP PRIORIDADE (pesos padrao)");
    for (const p of highlights.topPriority) {
      lines.push(`  ${p.code} - ${p.name} (${verticalNames[p.vertical]}) Score=${p.priorityScoreDefault.toFixed(1)}`);
    }
  }

  return lines.join("\n");
}
