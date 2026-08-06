// Roteador de IA: interpreta a pergunta e seleciona os sumários relevantes.
// Etapa 1 do RAG — não responde o usuário, apenas escolhe os dados.

import { callAi } from "./client.js";
import { summaryCatalog } from "./summaries/catalog.js";

interface RouterResult {
  summaries: string[];
  intent: string;
}

const ROUTER_SCHEMA = {
  type: "object" as const,
  properties: {
    summaries: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "IDs dos sumários relevantes para responder a pergunta",
    },
    intent: {
      type: "string" as const,
      description: "Intenção resumida da pergunta em uma frase curta",
    },
  },
  required: ["summaries", "intent"],
};

export async function routeQuestion(question: string): Promise<RouterResult> {
  const catalogText = summaryCatalog
    .map((s) => `- ${s.id}: ${s.label} — ${s.description}`)
    .join("\n");

  const systemText = [
    "Você é o roteador de consulta do VETOR Baldan, uma plataforma de governança de portfólio de inovação agrícola.",
    "Sua tarefa é interpretar a pergunta do usuário e selecionar quais sumários de dados são necessários para respondê-la.",
    "",
    "Sumários disponíveis:",
    catalogText,
    "",
    "Regras:",
    "1. Selecione APENAS os sumários necessários — não inclua todos.",
    "2. Se a pergunta for genérica (ex: 'como está o portfólio?'), selecione VISAO_GERAL.",
    "3. Se a pergunta mencionar um projeto específico, inclua PROJETOS.",
    "4. Se a pergunta for sobre pessoas/time, inclua EQUIPE.",
    "5. Se não conseguir classificar, selecione VISAO_GERAL.",
    "6. O campo intent deve resumir a intenção em português, em uma frase curta.",
  ].join("\n");

  const result = await callAi({
    systemText,
    messages: [{ role: "user", content: question }],
    schema: ROUTER_SCHEMA,
    temperature: 0.1,
  });

  const data = result.data as unknown as RouterResult;
  const validIds = new Set(summaryCatalog.map((s) => s.id));
  const summaries = (data.summaries || []).filter((id) => validIds.has(id));

  if (!summaries.length) summaries.push("VISAO_GERAL");

  return { summaries, intent: data.intent || question };
}
