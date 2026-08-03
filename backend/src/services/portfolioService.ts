import { verticals } from "../data/verticals.js";
import { projectTypes } from "../data/projectTypes.js";
import { funnelStages } from "../data/funnel.js";
import { platformParameters } from "../data/parameters.js";
import { people } from "../data/people.js";
import { generateProjects } from "../data/generateProjects.js";
import type { FunnelStageId, ProjectTypeId, VerticalId } from "../types/domain.js";

// Estado "em memória" — gerado uma vez na subida do processo.
// Não há banco de dados: reiniciar o servidor reseta o portfólio ao estado inicial.
const projects = generateProjects(180);

export interface ProjectQuery {
  vertical?: VerticalId;
  type?: ProjectTypeId;
  funnelStage?: FunnelStageId;
  search?: string;
  limit?: number;
  offset?: number;
}

export const portfolioService = {
  getVerticals: () => verticals,
  getProjectTypes: () => projectTypes,
  getFunnelStages: () => funnelStages,
  getParameters: () => platformParameters,
  getPeople: () => people,

  getProjects(query: ProjectQuery = {}) {
    let result = projects;

    if (query.vertical) result = result.filter((p) => p.vertical === query.vertical);
    if (query.type) result = result.filter((p) => p.type === query.type);
    if (query.funnelStage) result = result.filter((p) => p.funnelStage === query.funnelStage);
    if (query.search) {
      const term = query.search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
      );
    }

    const total = result.length;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? total;
    const page = result.slice(offset, offset + limit);

    return { items: page, total };
  },

  getProjectById(id: string) {
    return projects.find((p) => p.id === id || p.code.toLowerCase() === id.toLowerCase()) ?? null;
  },

  getHighlights() {
    const critical = projects
      .filter((p) => p.health === "critical" && p.spi !== null && p.cpi !== null)
      .sort((a, b) => Math.min(a.spi!, a.cpi!) - Math.min(b.spi!, b.cpi!))
      .slice(0, 4);

    const topPriority = [...projects]
      .sort((a, b) => b.priorityScoreDefault - a.priorityScoreDefault)
      .slice(0, 6);

    return { critical, topPriority };
  },

  getSummary() {
    const total = projects.length;
    const byVertical = verticals.map((v) => ({
      vertical: v.id,
      count: projects.filter((p) => p.vertical === v.id).length,
    }));
    const byFunnelStage = funnelStages.map((f) => ({
      stage: f.id,
      count: projects.filter((p) => p.funnelStage === f.id).length,
    }));
    const avgTrl = projects.reduce((sum, p) => sum + p.trl, 0) / total;
    const avgTir = projects.reduce((sum, p) => sum + p.tirPercent, 0) / total;
    const totalVpl = projects.reduce((sum, p) => sum + p.vplValueK, 0);
    const totalBudget = projects.reduce((sum, p) => sum + p.budgetK, 0);
    const executing = projects.filter((p) => p.spi !== null && p.cpi !== null);
    const avgSpi = executing.reduce((sum, p) => sum + (p.spi ?? 0), 0) / (executing.length || 1);
    const avgCpi = executing.reduce((sum, p) => sum + (p.cpi ?? 0), 0) / (executing.length || 1);
    const critical = projects.filter((p) => p.health === "critical").length;
    const attention = projects.filter((p) => p.health === "attention").length;

    return {
      total,
      byVertical,
      byFunnelStage,
      avgTrl: Math.round(avgTrl * 10) / 10,
      avgTir: Math.round(avgTir * 10) / 10,
      totalVplK: totalVpl,
      totalBudgetK: totalBudget,
      avgSpi: Math.round(avgSpi * 100) / 100,
      avgCpi: Math.round(avgCpi * 100) / 100,
      criticalCount: critical,
      attentionCount: attention,
      onTrackCount: total - critical - attention,
    };
  },
};
