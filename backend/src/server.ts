import express from "express";
import cors from "cors";
import { portfolioRouter } from "./routes/portfolioRoutes.js";
import { executionRouter } from "./routes/executionRoutes.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "vetor-backend", mocked: true });
});

app.use("/api", portfolioRouter);
app.use("/api", executionRouter);

app.listen(PORT, () => {
  console.log(`[VETOR API] mock server rodando em http://localhost:${PORT}`);
});
