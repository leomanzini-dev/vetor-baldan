import type { Request, Response } from "express";
import { executionService } from "../services/executionService.js";

export const executionController = {
  getExecutingProjects(_req: Request, res: Response) {
    res.json(executionService.getExecutingProjects());
  },

  getExecutionDetail(req: Request, res: Response) {
    const detail = executionService.getExecutionDetail(req.params.projectId);
    if (!detail) {
      res.status(404).json({ error: "Detalhe de execução não encontrado para este projeto" });
      return;
    }
    res.json(detail);
  },

  getCapacitySummary(_req: Request, res: Response) {
    res.json({ currentMonth: executionService.getCurrentMonthKey(), summary: executionService.getCapacitySummary() });
  },
};
