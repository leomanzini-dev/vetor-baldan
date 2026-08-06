import express from "express";
import cors from "cors";
import { portfolioRouter } from "./routes/portfolioRoutes.js";
import { executionRouter } from "./routes/executionRoutes.js";
import { aiRouter } from "./ia/routes.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "vetor-backend", mocked: true });
});

app.use("/api", portfolioRouter);
app.use("/api", executionRouter);
app.use("/api", aiRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[VETOR API] mock server rodando em http://localhost:${PORT}`);
});
