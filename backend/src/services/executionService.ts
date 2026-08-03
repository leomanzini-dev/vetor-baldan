import { generateExecutionDetails } from "../data/generateExecution.js";
import { people } from "../data/people.js";
import { platformParameters } from "../data/parameters.js";
import { portfolioService } from "./portfolioService.js";
import type { CapacitySummary, MicroStage } from "../types/domain.js";

const { items: allProjects } = portfolioService.getProjects({});
const executionDetails = generateExecutionDetails(allProjects);

const now = new Date();
const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

function isInCurrentMonth(iso: string): boolean {
  return iso.slice(0, 7) === currentMonthKey;
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
};
