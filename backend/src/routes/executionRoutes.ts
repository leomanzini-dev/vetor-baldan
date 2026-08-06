import { Router } from "express";
import { executionController } from "../controllers/executionController.js";

export const executionRouter = Router();

executionRouter.get("/execution/projects", executionController.getExecutingProjects);
executionRouter.get("/execution/capacity", executionController.getCapacitySummary);
executionRouter.get("/execution/:projectId", executionController.getExecutionDetail);
