// Respondedor final: recebe os sumários selecionados e gera a resposta ao usuário.
// Etapa 2 do RAG — usa SOMENTE o texto dos sumários como contexto.

import { callAi } from "./client.js";
import { loadSummaries } from "./summaries/hub.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    answer: {
      type: "string" as const,
      description: "Resposta ao usuário em português, clara e direta",
    },
  },
  required: ["answer"],
};

export async function generateResponse(
  question: string,
  summaryIds: string[],
  intent: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const context = loadSummaries(summaryIds);

  const systemText = [
    "Você é o assistente de IA do VETOR Baldan — plataforma de governança de portfólio de inovação da Baldan (implementos agrícolas).",
    "",
    "REGRAS ABSOLUTAS:",
    "1. Responda SOMENTE com base nos dados fornecidos abaixo. Nunca invente dados.",
    "2. Se a informação não estiver nos dados, diga claramente que não tem essa informação.",
    "3. Responda em português brasileiro, de forma profissional e direta.",
    "4. Use números e porcentagens quando disponíveis.",
    "5. Não repita o contexto integralmente — sintetize.",
    "6. Se houver projetos críticos ou sobrecarga, destaque.",
    "",
    "CONTEXTO DOS DADOS DO VETOR:",
    "========================",
    context,
    "========================",
    "",
    `Intenção detectada: ${intent}`,
  ].join("\n");

  const messages: ChatMessage[] = [...history, { role: "user", content: question }];

  const result = await callAi({
    systemText,
    messages,
    schema: RESPONSE_SCHEMA,
    temperature: 0.3,
  });

  return (result.data as { answer?: string }).answer || "Não foi possível gerar uma resposta.";
}
