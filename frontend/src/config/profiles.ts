import type { PersonProfile } from "@/types/domain";

export const profileLabels: Record<PersonProfile, string> = {
  diretoria: "Diretoria",
  pmo: "PMO",
  area: "Área",
  controladoria: "Controladoria",
  executor: "Executor",
};

export const profileDescriptions: Record<PersonProfile, string> = {
  diretoria: "Visão executiva do portfólio completo, decisões de gate.",
  pmo: "Governança, padronização e acompanhamento cross-projeto.",
  area: "Gestão dos projetos e equipes da própria vertical.",
  controladoria: "Acompanhamento financeiro e de indicadores de custo.",
  executor: "Execução de micro-etapas e acompanhamento de pontos.",
};
