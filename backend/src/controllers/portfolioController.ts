import type { Request, Response } from "express";
import { portfolioService } from "../services/portfolioService.js";
import type { FunnelStageId, ProjectTypeId, VerticalId } from "../types/domain.js";

export const portfolioController = {
  getVerticals(_req: Request, res: Response) {
    res.json(portfolioService.getVerticals());
  },

  getProjectTypes(_req: Request, res: Response) {
    res.json(portfolioService.getProjectTypes());
  },

  getFunnelStages(_req: Request, res: Response) {
    res.json(portfolioService.getFunnelStages());
  },

  getParameters(_req: Request, res: Response) {
    res.json(portfolioService.getParameters());
  },

  getPeople(_req: Request, res: Response) {
    res.json(portfolioService.getPeople());
  },

  getSummary(_req: Request, res: Response) {
    res.json(portfolioService.getSummary());
  },

  getHighlights(_req: Request, res: Response) {
    res.json(portfolioService.getHighlights());
  },

  getProjects(req: Request, res: Response) {
    const { vertical, type, funnelStage, search, limit, offset } = req.query;
    const result = portfolioService.getProjects({
      vertical: vertical as VerticalId | undefined,
      type: type as ProjectTypeId | undefined,
      funnelStage: funnelStage as FunnelStageId | undefined,
      search: search as string | undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    res.json(result);
  },

  getProjectById(req: Request, res: Response) {
    const project = portfolioService.getProjectById(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Projeto não encontrado" });
      return;
    }
    res.json(project);
  },
};
