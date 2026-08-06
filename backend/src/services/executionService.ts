import { generateExecutionDetails, sCurve, timeProgressFraction } from "../data/generateExecution.js";
import { people } from "../data/people.js";
import { platformParameters } from "../data/parameters.js";
import { portfolioService } from "./portfolioService.js";
import type { CapacitySummary, MicroStage, PortfolioScurve, PortfolioScurvePoint } from "../types/domain.js";

const { items: allProjects } = portfolioService.getProjects({});
const executionDetails = generateExecutionDetails(allProjects);

const now = new Date();
const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

function isInCurrentMonth(iso: string): boolean {
  return iso.slice(0, 7) === currentMonthKey;
}

const scurveProjects = allProjects.filter((p) => p.funnelStage === "execucao" || p.funnelStage === "encerrado");

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export const executionService = {
  getExecutingProjects() {
    return allProjects.filter((p) => p.funnelStage === "execucao" || p.funnelStage === "encerrado");
  },

  getExecutionDetail(projectId: string) {
    return executionDetails.get(projectId) ?? null;
  },

  getAllMicroStages(): MicroStage[] {
    return Array.from(executionDetails.values()).flatMap((d) => d.microStages);
  },

  getCapacitySummary(): CapacitySummary[] {
    const allMicroStages = this.getAllMicroStages();
    const executors = people.filter((p) => p.profile === "executor");

    return executors.map((person) => {
      const monthlyCapacityPoints = person.dailyHours * platformParameters.workingDaysPerMonth * platformParameters.pointsPerHour;

      const microStages = allMicroStages.filter(
        (m) => m.assigneeId === person.id && isInCurrentMonth(m.dueDate)
      );

      const pointsEarned = microStages.filter((m) => m.status === "concluida").reduce((sum, m) => sum + m.points, 0);
      const pointsCommitted = microStages.reduce((sum, m) => sum + m.points, 0);

      return { person, monthlyCapacityPoints, pointsEarned, pointsCommitted, microStages };
    });
  },

  getCurrentMonthKey() {
    return currentMonthKey;
  },

  // Curva-S agregada: baseline planejado é a mesma curva logística normalizada
  // para todo projeto (independe da duração real, pois t já é relativo ao
  // próprio prazo do projeto); a "tendência" por projeto é o baseline ajustado
  // pelo SPI dele. Um único ponto de corte (progresso médio do portfólio)
  // separa a série em "real" (sólida, até hoje) e "projeção" (tracejada, dali
  // em diante) — evita uma transição serrilhada por ter 60+ projetos cruzando
  // esse ponto em momentos diferentes.
  getPortfolioScurve(): PortfolioScurve {
    const projects = scurveProjects;
    if (projects.length === 0) {
      return { points: [], progressPct: 0, avgSpi: 1, projectCount: 0 };
    }

    const progressFractions = projects.map((p) => (p.funnelStage === "encerrado" ? 1 : timeProgressFraction(p, now)));
    const progress = progressFractions.reduce((a, b) => a + b, 0) / projects.length;
    const avgSpi = projects.reduce((a, p) => a + (p.spi ?? 1), 0) / projects.length;

    function trendAt(t: number): { planned: number; avg: number } {
      const planned = sCurve(t) * 100;
      const values = projects.map((p) => clampPct(planned * (p.spi ?? 1)));
      return { planned, avg: values.reduce((a, b) => a + b, 0) / values.length };
    }

    const ts = new Set<number>();
    for (let i = 0; i <= 20; i++) ts.add(i / 20);
    ts.add(progress);

    const points: PortfolioScurvePoint[] = Array.from(ts)
      .sort((a, b) => a - b)
      .map((t) => {
        const { planned, avg } = trendAt(t);
        return {
          tPct: round1(t * 100),
          plannedPct: round1(planned),
          actualPct: t <= progress ? round1(avg) : null,
          projectedPct: t >= progress ? round1(avg) : null,
        };
      });

    return {
      points,
      progressPct: round1(progress * 100),
      avgSpi: Math.round(avgSpi * 100) / 100,
      projectCount: projects.length,
    };
  },
};
