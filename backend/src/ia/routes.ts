// Rotas Express da IA: POST /api/ai/chat e GET /api/ai/summaries

import { Router } from "express";
import type { Request, Response } from "express";
import { routeQuestion } from "./router.js";
import { generateResponse } from "./responder.js";
import { loadSummary, loadAllSummaries } from "./summaries/hub.js";
import { summaryCatalog } from "./summaries/catalog.js";
import { generateExternalRiskAnalysis, type ExternalRiskInput } from "./externalRisk.js";

export const aiRouter = Router();

// POST /api/ai/chat — pergunta do usuário → roteamento → resposta
aiRouter.post("/ai/chat", async (req: Request, res: Response) => {
  try {
    const { question, history } = req.body as {
      question?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    if (!question || typeof question !== "string" || !question.trim()) {
      res.status(400).json({ error: "Campo 'question' é obrigatório." });
      return;
    }

    console.log(`[IA] Pergunta recebida: "${question.slice(0, 120)}"`);

    // Etapa 1 — roteamento: seleciona os sumários
    const { summaries, intent } = await routeQuestion(question.trim());
    console.log(`[IA] Sumários selecionados: ${summaries.join(", ")} | Intent: ${intent}`);

    // Etapa 2 — resposta: gera a resposta com base nos sumários
    const answer = await generateResponse(question.trim(), summaries, intent, history || []);
    console.log(`[IA] Resposta gerada (${answer.length} chars)`);

    res.json({ answer, summaries, intent });
  } catch (error: unknown) {
    const msg = (error as Error)?.message || "Erro interno da IA";
    console.error("[IA] Falha:", msg);
    res.status(502).json({ error: msg });
  }
});

// POST /api/ai/external-risk — hipóteses de risco externo (câmbio, safra,
// eleições) para um projeto — prompt dedicado, fora do fluxo de chat porque
// aqui a IA deve ESPECULAR com conhecimento geral, não só responder com base
// nos sumários do VETOR.
aiRouter.post("/ai/external-risk", async (req: Request, res: Response) => {
  try {
    const input = req.body as Partial<ExternalRiskInput>;
    if (!input.projectCode || !input.projectName) {
      res.status(400).json({ error: "Campos 'projectCode' e 'projectName' são obrigatórios." });
      return;
    }

    console.log(`[IA] Análise de risco externo para ${input.projectCode}`);
    const answer = await generateExternalRiskAnalysis(input as ExternalRiskInput);
    res.json({ answer });
  } catch (error: unknown) {
    const msg = (error as Error)?.message || "Erro interno da IA";
    console.error("[IA] Falha (risco externo):", msg);
    res.status(502).json({ error: msg });
  }
});

// GET /api/ai/summaries — lista todos os sumários disponíveis (depuração)
aiRouter.get("/ai/summaries", (_req: Request, res: Response) => {
  res.json({ catalog: summaryCatalog });
});

// GET /api/ai/summaries/:id — retorna o texto de um sumário específico (depuração)
aiRouter.get("/ai/summaries/:id", (req: Request, res: Response) => {
  const text = loadSummary(req.params.id);
  res.type("text/plain").send(text);
});

// GET /api/ai/summaries-all — retorna todos os sumários combinados (depuração)
aiRouter.get("/ai/summaries-all", (_req: Request, res: Response) => {
  res.type("text/plain").send(loadAllSummaries());
});
