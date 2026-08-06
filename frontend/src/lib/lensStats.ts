import { lensDefs } from "@/config/lenses";
import type { Project, ProjectScores } from "@/types/domain";

export interface LensAverage {
  id: keyof ProjectScores;
  label: string;
  short: string;
  avgScore: number; // 0-100, média do portfólio nessa lente
}

// Perfil estratégico do portfólio: média de cada uma das 8 lentes fixas
// (ligadas a campos reais de ProjectScores) através de todos os projetos.
// Lentes customizadas (criadas em tempo de execução na Priorização) ficam de
// fora — não têm nota real no dataset e tornariam a leitura instável entre
// sessões, então não fazem sentido num indicador executivo estável.
export function averageLensScores(projects: Project[]): LensAverage[] {
  if (projects.length === 0) return [];

  return lensDefs
    .map((lens) => {
      const key = lens.id as keyof ProjectScores;
      const sum = projects.reduce((acc, p) => acc + p.scores[key], 0);
      return {
        id: key,
        label: lens.label,
        short: lens.short,
        avgScore: Math.round((sum / projects.length) * 10) / 10,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);
}
