// Sumário: Catálogo de Projetos

import { portfolioService } from "../../services/portfolioService.js";

export function buildProjetosSummary(): string {
  const { items: projects } = portfolioService.getProjects({});
  const verticals = portfolioService.getVerticals();
  const types = portfolioService.getProjectTypes();

  const verticalNames: Record<string, string> = {};
  for (const v of verticals) verticalNames[v.id] = v.name;

  const typeNames: Record<string, string> = {};
  for (const t of types) typeNames[t.id] = t.name;

  const funnelLabels: Record<string, string> = {
    captacao: "Captação", triagem: "Triagem", avaliacao: "Avaliação",
    gate: "Gate", execucao: "Execução", encerrado: "Encerrado",
  };

  const people = portfolioService.getPeople();
  const personNames: Record<string, string> = {};
  for (const p of people) personNames[p.id] = p.name;

  const lines: string[] = [
    "#-# CATALOGO DE PROJETOS",
    "",
    `Total: ${projects.length}`,
    "",
  ];

  for (const p of projects) {
    lines.push(
      `${p.code} | ${p.name}`,
      `  Vertical: ${verticalNames[p.vertical]} | Tipo: ${typeNames[p.type]} | Funil: ${funnelLabels[p.funnelStage]}`,
      `  TRL: ${p.trl} | TIR: ${p.tirPercent.toFixed(1)}% | VPL: R$${(p.vplValueK * 1000).toLocaleString("pt-BR")} | Orcamento: R$${(p.budgetK * 1000).toLocaleString("pt-BR")}`,
      `  Saude: ${p.health} | Score padrao: ${p.priorityScoreDefault.toFixed(1)}`,
      `  Lider: ${personNames[p.leaderId] || "—"} | Sponsor: ${personNames[p.sponsorId] || "—"}`,
      `  Inicio: ${p.startDate} | Entrega: ${p.targetDate}`,
      "",
    );
  }

  return lines.join("\n");
}
