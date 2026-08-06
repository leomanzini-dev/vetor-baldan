import { bandForTrl, trlBands } from "@/config/trl";
import { parseLocalDate } from "@/lib/format";
import type { Project, VerticalId } from "@/types/domain";

export interface RoadmapYearEntry {
  year: number;
  descoberta: number;
  validacao: number;
  escala: number;
}

export function computeRoadmapByYear(projects: Project[]): RoadmapYearEntry[] {
  if (projects.length === 0) return [];

  const startYears = projects.map((p) => parseLocalDate(p.startDate).getFullYear());
  const endYears = projects.map((p) => parseLocalDate(p.targetDate).getFullYear());
  const minYear = Math.min(...startYears);
  const maxYear = Math.max(...endYears);

  const years: RoadmapYearEntry[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    years.push({ year, descoberta: 0, validacao: 0, escala: 0 });
  }

  for (const project of projects) {
    const startYear = parseLocalDate(project.startDate).getFullYear();
    const endYear = parseLocalDate(project.targetDate).getFullYear();
    const band = bandForTrl(project.trl);
    for (let year = startYear; year <= endYear; year++) {
      const entry = years.find((y) => y.year === year);
      if (entry) entry[band] += 1;
    }
  }

  return years;
}

export function trlDistribution(projects: Project[]): { level: number; count: number }[] {
  const counts = Array.from({ length: 9 }, (_, i) => ({ level: i + 1, count: 0 }));
  for (const project of projects) {
    const entry = counts.find((c) => c.level === project.trl);
    if (entry) entry.count += 1;
  }
  return counts;
}

export function bandCounts(projects: Project[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const band of trlBands) counts[band.id] = 0;
  for (const project of projects) counts[bandForTrl(project.trl)] += 1;
  return counts;
}

export interface CapexYearEntry {
  year: number;
  capexK: number; // CAPEX cumulativo comprometido até este ano (soma de orçamento dos projetos já iniciados)
}

// CAPEX comprometido acumulado por ano — cada projeto entra na soma a partir
// do ano em que começa e permanece (orçamento já alocado não "sai" do total
// comprometido), gerando a curva de investimento crescente do portfólio.
export function cumulativeCapexByYear(projects: Project[]): CapexYearEntry[] {
  if (projects.length === 0) return [];
  const startYears = projects.map((p) => parseLocalDate(p.startDate).getFullYear());
  const minYear = Math.min(...startYears);
  const maxYear = Math.max(...startYears, new Date().getFullYear());

  const entries: CapexYearEntry[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    const capexK = projects
      .filter((p) => parseLocalDate(p.startDate).getFullYear() <= year)
      .reduce((sum, p) => sum + p.budgetK, 0);
    entries.push({ year, capexK: Math.round(capexK) });
  }
  return entries;
}

export interface VerticalCapexEntry {
  vertical: VerticalId;
  capexK: number;
}

export function capexByVertical(projects: Project[]): VerticalCapexEntry[] {
  const totals = new Map<VerticalId, number>();
  for (const p of projects) totals.set(p.vertical, (totals.get(p.vertical) ?? 0) + p.budgetK);
  return Array.from(totals.entries())
    .map(([vertical, capexK]) => ({ vertical, capexK: Math.round(capexK) }))
    .sort((a, b) => b.capexK - a.capexK);
}

function lerp(year: number, y0: number, v0: number, y1: number, v1: number): number {
  if (y1 <= y0) return v1;
  const t = Math.min(Math.max((year - y0) / (y1 - y0), 0), 1);
  return v0 + (v1 - v0) * t;
}

// Projeção automática de maturidade: sem uma trajetória TRL registrada
// historicamente, interpolamos entre 3 âncoras reais do próprio projeto —
// TRL 1 no início, o TRL atual hoje, e TRL 9 na conclusão prevista (ou o
// TRL atual, se já maior que o que a reta preveria). Projetos encerrados
// são tratados como já maduros (TRL 9) a partir da conclusão.
export function projectTrl(project: Project, year: number): number {
  const startYear = parseLocalDate(project.startDate).getFullYear();
  const targetYear = parseLocalDate(project.targetDate).getFullYear();
  const nowYear = new Date().getFullYear();
  const currentTrl = project.trl;

  let raw: number;
  if (project.funnelStage === "encerrado" && year >= targetYear) {
    raw = 9;
  } else if (year <= startYear) {
    raw = 1;
  } else if (year <= nowYear) {
    raw = lerp(year, startYear, 1, Math.max(nowYear, startYear + 1), currentTrl);
  } else {
    raw = Math.max(currentTrl, lerp(year, Math.max(nowYear, startYear), currentTrl, targetYear, 9));
  }

  return Math.max(1, Math.min(9, Math.round(raw)));
}

// Duração do projeto em anos (mínimo 1, evita divisão por zero em projetos
// cujo início e conclusão caem no mesmo ano).
export function projectDurationYears(project: Project): number {
  const startYear = parseLocalDate(project.startDate).getFullYear();
  const targetYear = parseLocalDate(project.targetDate).getFullYear();
  return Math.max(1, targetYear - startYear);
}

// CAPEX anual médio — não temos alocação orçamentária ano a ano no modelo de
// dados, então distribuímos o orçamento total igualmente pela duração. É uma
// média, não um cronograma de desembolso real.
export function annualCapex(project: Project): number {
  return project.budgetK / projectDurationYears(project);
}

// Payback estimado (anos): CAPEX ÷ retorno médio anual implícito no VPL.
// Estimativa simplificada de "quantos anos até o VPL cobrir o investimento
// no ritmo médio", não um fluxo de caixa descontado real — null quando o
// projeto não gera VPL positivo (não há payback a estimar).
export function estimatedPaybackYears(project: Project): number | null {
  if (project.vplValueK <= 0 || project.budgetK <= 0) return null;
  const annualReturn = project.vplValueK / projectDurationYears(project);
  if (annualReturn <= 0) return null;
  return project.budgetK / annualReturn;
}
