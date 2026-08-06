// Sumário: Maturidade Tecnológica (TRL)

import { portfolioService } from "../../services/portfolioService.js";

export function buildMaturidadeSummary(): string {
  const { items: projects } = portfolioService.getProjects({});
  const verticals = portfolioService.getVerticals();

  const verticalNames: Record<string, string> = {};
  for (const v of verticals) verticalNames[v.id] = v.name;

  const trlCounts = Array.from({ length: 9 }, (_, i) => ({
    level: i + 1,
    count: projects.filter((p) => p.trl === i + 1).length,
  }));

  const bands = [
    { label: "Descoberta (TRL 1-3)", levels: [1, 2, 3] },
    { label: "Validação (TRL 4-6)", levels: [4, 5, 6] },
    { label: "Escala (TRL 7-9)", levels: [7, 8, 9] },
  ];

  const lines: string[] = [
    "#-# MATURIDADE TECNOLOGICA (TRL)",
    "",
    `TRL médio do portfólio: ${(projects.reduce((s, p) => s + p.trl, 0) / (projects.length || 1)).toFixed(1)}`,
    "",
    "#-# DISTRIBUICAO POR NIVEL TRL",
  ];

  for (const t of trlCounts) {
    lines.push(`  TRL ${t.level}: ${t.count} projetos`);
  }

  lines.push("", "#-# DISTRIBUICAO POR FAIXA");
  for (const band of bands) {
    const count = band.levels.reduce((s, l) => s + (trlCounts[l - 1]?.count ?? 0), 0);
    lines.push(`  ${band.label}: ${count} projetos`);
  }

  lines.push("", "#-# PROXIMOS A ESCALAR (TRL 5-6, prontos para subir)");
  const nearScale = projects
    .filter((p) => p.trl >= 5 && p.trl <= 6)
    .sort((a, b) => b.trl - a.trl)
    .slice(0, 8);

  for (const p of nearScale) {
    lines.push(`  ${p.code} - ${p.name} (${verticalNames[p.vertical]}) TRL ${p.trl} → ${p.trl + 1}`);
  }

  return lines.join("\n");
}
