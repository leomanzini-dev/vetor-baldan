// Analista de riscos externos: ao contrário do chat principal (que só pode
// responder com base nos sumários do VETOR — "nunca inventar dados"), esta
// tarefa é justamente pedir à IA para especular, com conhecimento geral,
// sobre fatores de fora do sistema (câmbio, safra, calendário eleitoral).
// Por isso usa um prompt próprio, sem passar pelo roteador/responder do chat.

import { callAi } from "./client.js";

const SCHEMA = {
  type: "object" as const,
  properties: {
    answer: { type: "string" as const, description: "Análise em português, poucas frases" },
  },
  required: ["answer"],
};

export interface ExternalRiskInput {
  projectCode: string;
  projectName: string;
  vertical: string;
  type: string;
  trl: number;
  spi: number | null;
  cpi: number | null;
  health: string;
  description: string;
}

export async function generateExternalRiskAnalysis(input: ExternalRiskInput): Promise<string> {
  const now = new Date();
  const currentDateLabel = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const systemText = [
    "Você é um analista de riscos externos e macro para a Baldan, fabricante brasileira de implementos agrícolas.",
    `Hoje é ${currentDateLabel}.`,
    "",
    "SUA TAREFA: levantar hipóteses PLAUSÍVEIS de fatores externos que podem pressionar um projeto específico do " +
      "portfólio agora — câmbio, clima/safra, calendário eleitoral brasileiro, crédito rural, cenário macroeconômico, " +
      "concorrência no setor de máquinas agrícolas.",
    "",
    "REGRAS:",
    "1. Você NÃO tem acesso a notícias, cotações ou dados de mercado em tempo real — nunca invente números " +
      "específicos de 'hoje' (ex.: 'o dólar está a R$X agora', 'choveu Y mm essa semana'). " +
      "Em vez disso, raciocine sobre padrões e ciclos conhecidos a partir da data de hoje informada acima " +
      "(ex.: se o ano é de eleição presidencial no Brasil — eleições ocorrem a cada 4 anos —, se o mês corresponde a " +
      "época de plantio/colheita para a cultura relevante, ciclo de crédito rural do Plano Safra).",
    "2. Deixe explícito que são hipóteses a verificar, nunca fatos confirmados — não afirme como se fossem notícia.",
    "3. Responda em português brasileiro, direto, poucas frases.",
    "4. Termine com 2-3 pontos concretos que a equipe deveria monitorar ou verificar com fontes reais.",
  ].join("\n");

  const question = [
    `Projeto ${input.projectCode} · ${input.projectName}`,
    `Vertical: ${input.vertical} · Tipo: ${input.type} · TRL ${input.trl}`,
    `SPI ${input.spi ?? "—"} · CPI ${input.cpi ?? "—"} · Saúde: ${input.health}`,
    `Descrição: "${input.description}"`,
    "",
    "Levante as hipóteses de risco externo mais relevantes para este projeto agora, considerando a data de hoje.",
  ].join("\n");

  const result = await callAi({
    systemText,
    messages: [{ role: "user", content: question }],
    schema: SCHEMA,
    temperature: 0.6,
  });

  return (result.data as { answer?: string }).answer || "Não foi possível gerar a análise agora.";
}
