import { lensDefs, type LensId } from "@/config/lenses";
import type { Project, ProjectScores } from "@/types/domain";

export interface LensContribution {
  lens: LensId;
  score: number; // 0-100, nota bruta do projeto na lente
  weight: number; // peso bruto configurado (0-100)
  normalizedWeight: number; // 0-1, weight / soma dos pesos
  contribution: number; // normalizedWeight * score — quanto a lente empurrou a nota final
}

export interface ScoredProject {
  project: Project;
  total: number; // 0-100
  contributions: LensContribution[]; // ordenadas por contribution desc
}

export function weightedContributions(scores: ProjectScores, weights: Record<LensId, number>): LensContribution[] {
  const weightSum = lensDefs.reduce((sum, lens) => sum + Math.max(weights[lens.id], 0), 0) || 1;

  return lensDefs
    .map((lens) => {
      const weight = Math.max(weights[lens.id], 0);
      const normalizedWeight = weight / weightSum;
      const score = scores[lens.id];
      return {
        lens: lens.id,
        score,
        weight,
        normalizedWeight,
        contribution: normalizedWeight * score,
      };
    })
    .sort((a, b) => b.contribution - a.contribution);
}

export function weightedTotal(scores: ProjectScores, weights: Record<LensId, number>): number {
  const total = weightedContributions(scores, weights).reduce((sum, c) => sum + c.contribution, 0);
  return Math.round(total * 10) / 10;
}

export function scoreProject(project: Project, weights: Record<LensId, number>): ScoredProject {
  const contributions = weightedContributions(project.scores, weights);
  const total = contributions.reduce((sum, c) => sum + c.contribution, 0);
  return { project, total: Math.round(total * 10) / 10, contributions };
}

export function rankProjects(projects: Project[], weights: Record<LensId, number>): ScoredProject[] {
  return projects
    .map((project) => scoreProject(project, weights))
    .sort((a, b) => b.total - a.total);
}
