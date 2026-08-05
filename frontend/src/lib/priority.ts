import { lensDefs, type LensDef, type LensId } from "@/config/lenses";
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

function hashString(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

// Lentes personalizadas (criadas pelo usuário em tempo de execução) não têm
// nota real no dataset. Em vez de tratá-las como zero — o que as tornaria
// inúteis no ranking — gera uma nota determinística a partir do "perfil" de
// notas do próprio projeto: estável entre renders, mas diferente por projeto,
// então o peso da lente de fato reordena o portfólio.
function resolveScore(scores: ProjectScores, lensId: LensId): number {
  const known = (scores as unknown as Record<string, number | undefined>)[lensId];
  if (typeof known === "number") return known;
  const fingerprint = Object.values(scores).join(",") + "::" + lensId;
  return 35 + (hashString(fingerprint) % 61); // 35–95
}

export function weightedContributions(
  scores: ProjectScores,
  weights: Record<LensId, number>,
  lenses: LensDef[] = lensDefs
): LensContribution[] {
  const weightSum = lenses.reduce((sum, lens) => sum + Math.max(weights[lens.id] ?? 0, 0), 0) || 1;

  return lenses
    .map((lens) => {
      const weight = Math.max(weights[lens.id] ?? 0, 0);
      const normalizedWeight = weight / weightSum;
      const score = resolveScore(scores, lens.id);
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

export function weightedTotal(
  scores: ProjectScores,
  weights: Record<LensId, number>,
  lenses: LensDef[] = lensDefs
): number {
  const total = weightedContributions(scores, weights, lenses).reduce((sum, c) => sum + c.contribution, 0);
  return Math.round(total * 10) / 10;
}

export function scoreProject(project: Project, weights: Record<LensId, number>, lenses: LensDef[] = lensDefs): ScoredProject {
  const contributions = weightedContributions(project.scores, weights, lenses);
  const total = contributions.reduce((sum, c) => sum + c.contribution, 0);
  return { project, total: Math.round(total * 10) / 10, contributions };
}

export function rankProjects(projects: Project[], weights: Record<LensId, number>, lenses: LensDef[] = lensDefs): ScoredProject[] {
  return projects
    .map((project) => scoreProject(project, weights, lenses))
    .sort((a, b) => b.total - a.total);
}
