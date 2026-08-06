// Hub de sumários: carrega e combina os sumários selecionados.

import { buildDashboardSummary } from "./dashboard.js";
import { buildPriorizacaoSummary } from "./priorizacao.js";
import { buildMaturidadeSummary } from "./maturidade.js";
import { buildExecucaoSummary } from "./execucao.js";
import { buildProjetosSummary } from "./projetos.js";
import { buildEquipeSummary } from "./equipe.js";
import { buildSegurancaSummary } from "./seguranca.js";

type SummaryId =
  | "VISAO_GERAL"
  | "PRIORIZACAO"
  | "MATURIDADE"
  | "EXECUCAO"
  | "PROJETOS"
  | "EQUIPE"
  | "SEGURANCA";

const builders: Record<SummaryId, () => string> = {
  VISAO_GERAL: buildDashboardSummary,
  PRIORIZACAO: buildPriorizacaoSummary,
  MATURIDADE: buildMaturidadeSummary,
  EXECUCAO: buildExecucaoSummary,
  PROJETOS: buildProjetosSummary,
  EQUIPE: buildEquipeSummary,
  SEGURANCA: buildSegurancaSummary,
};

export function loadSummary(id: string): string {
  const builder = builders[id as SummaryId];
  if (!builder) return `[Sumário "${id}" não encontrado]`;
  return builder();
}

export function loadSummaries(ids: string[]): string {
  return ids.map((id) => loadSummary(id)).join("\n\n");
}

export function loadAllSummaries(): string {
  return Object.values(builders).map((fn) => fn()).join("\n\n");
}
