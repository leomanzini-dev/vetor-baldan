// Sumário: Execução e Capacidade

import { portfolioService } from "../../services/portfolioService.js";
import { executionService } from "../../services/executionService.js";

export function buildExecucaoSummary(): string {
  const executing = executionService.getExecutingProjects();
  const capacity = executionService.getCapacitySummary();
  const verticals = portfolioService.getVerticals();

  const verticalNames: Record<string, string> = {};
  for (const v of verticals) verticalNames[v.id] = v.name;

  const inExec = executing.filter((p) => p.funnelStage === "execucao");
  const closed = executing.filter((p) => p.funnelStage === "encerrado");

  const criticalExec = inExec.filter((p) => p.health === "critical");
  const attentionExec = inExec.filter((p) => p.health === "attention");

  const lines: string[] = [
    "#-# EXECUCAO E CAPACIDADE",
    "",
    `Projetos em execução: ${inExec.length}`,
    `Projetos encerrados: ${closed.length}`,
    `Críticos na execução: ${criticalExec.length}`,
    `Atenção na execução: ${attentionExec.length}`,
    "",
    `SPI médio: ${(inExec.reduce((s, p) => s + (p.spi ?? 1), 0) / (inExec.length || 1)).toFixed(2)}`,
    `CPI médio: ${(inExec.reduce((s, p) => s + (p.cpi ?? 1), 0) / (inExec.length || 1)).toFixed(2)}`,
  ];

  if (criticalExec.length) {
    lines.push("", "#-# PROJETOS CRITICOS EM EXECUCAO");
    for (const p of criticalExec.slice(0, 6)) {
      lines.push(`  ${p.code} - ${p.name} (${verticalNames[p.vertical]}) SPI=${p.spi?.toFixed(2)} CPI=${p.cpi?.toFixed(2)}`);
    }
  }

  lines.push("", `#-# CAPACIDADE DA EQUIPE (${executionService.getCurrentMonthKey()})`);
  const overloaded = capacity.filter((c) => c.pointsCommitted > c.monthlyCapacityPoints);

  lines.push(`Executores: ${capacity.length}`);
  lines.push(`Sobrecarregados: ${overloaded.length}`);
  lines.push("");

  for (const c of capacity.slice(0, 10)) {
    const pct = c.monthlyCapacityPoints > 0 ? Math.round((c.pointsEarned / c.monthlyCapacityPoints) * 100) : 0;
    const flag = c.pointsCommitted > c.monthlyCapacityPoints ? " ⚠ SOBRECARGA" : "";
    lines.push(`  ${c.person.name} (${c.person.role}): ${c.pointsEarned}/${c.monthlyCapacityPoints} pts (${pct}%)${flag}`);
  }

  return lines.join("\n");
}
