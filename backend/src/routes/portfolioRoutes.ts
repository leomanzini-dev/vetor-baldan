import { Router } from "express";
import { portfolioController } from "../controllers/portfolioController.js";

export const portfolioRouter = Router();

portfolioRouter.get("/verticals", portfolioController.getVerticals);
portfolioRouter.get("/project-types", portfolioController.getProjectTypes);
portfolioRouter.get("/funnel-stages", portfolioController.getFunnelStages);
portfolioRouter.get("/parameters", portfolioController.getParameters);
portfolioRouter.get("/people", portfolioController.getPeople);
portfolioRouter.get("/portfolio/summary", portfolioController.getSummary);
portfolioRouter.get("/portfolio/highlights", portfolioController.getHighlights);
portfolioRouter.get("/projects", portfolioController.getProjects);
portfolioRouter.get("/projects/:id", portfolioController.getProjectById);
