import { bandForTrl, trlBands } from "@/config/trl";
import { parseLocalDate } from "@/lib/format";
import type { Project } from "@/types/domain";

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
