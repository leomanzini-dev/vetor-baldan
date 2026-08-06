// Sumário: Equipe e Perfis

import { portfolioService } from "../../services/portfolioService.js";

export function buildEquipeSummary(): string {
  const people = portfolioService.getPeople();
  const verticals = portfolioService.getVerticals();

  const verticalNames: Record<string, string> = {};
  for (const v of verticals) verticalNames[v.id] = v.name;

  const profileLabels: Record<string, string> = {
    diretoria: "Diretoria",
    pmo: "PMO",
    area: "Gestor de Área",
    controladoria: "Controladoria",
    executor: "Executor",
  };

  const grouped: Record<string, typeof people> = {};
  for (const p of people) {
    const key = p.profile;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  const lines: string[] = [
    "#-# EQUIPE E PERFIS",
    "",
    `Total de membros: ${people.length}`,
    "",
  ];

  for (const [profile, members] of Object.entries(grouped)) {
    lines.push(`#-# ${(profileLabels[profile] || profile).toUpperCase()} (${members.length})`);
    for (const p of members) {
      const vert = p.vertical ? verticalNames[p.vertical] || p.vertical : "Transversal";
      lines.push(`  ${p.name} — ${p.role} | ${vert} | ${p.dailyHours}h/dia`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
