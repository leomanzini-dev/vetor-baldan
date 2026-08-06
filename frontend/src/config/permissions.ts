import type { PersonProfile } from "@/types/domain";

export const profileCapabilities: Record<PersonProfile, string[]> = {
  diretoria: [
    "Visão executiva de todo o portfólio, sem restrição de vertical",
    "Aprova ou reprova projetos nos gates de decisão",
    "Ajusta pesos de priorização e parâmetros globais da plataforma",
  ],
  pmo: [
    "Governança cross-projeto e padronização de processos",
    "Edita a escala TRL e os pesos de priorização",
    "Acompanha status report e curva-S de todos os projetos em execução",
  ],
  area: [
    "Gestão dos projetos e da equipe da própria vertical",
    "Atribui micro-etapas e acompanha a capacidade do time",
    "Submete novas ideias para o funil de inovação",
  ],
  controladoria: [
    "Acompanhamento financeiro — orçado x realizado, CPI",
    "Visão somente leitura sobre todo o portfólio",
    "Auditoria dos indicadores de custo por projeto",
  ],
  executor: [
    "Vê e executa as micro-etapas atribuídas a si",
    "Faz o check diário de entregas e acompanha seus pontos",
    "Visão restrita aos projetos em que está alocado",
  ],
};

export type AccessLevel = "edita" | "visualiza" | "—";

export interface ScreenAccess {
  screen: string;
  path: string;
  access: Record<PersonProfile, AccessLevel>;
}

export const screenAccessMatrix: ScreenAccess[] = [
  {
    screen: "Painel Executivo",
    path: "/",
    access: { diretoria: "visualiza", pmo: "visualiza", area: "visualiza", controladoria: "visualiza", executor: "visualiza" },
  },
  {
    screen: "Priorização",
    path: "/priorizacao",
    access: { diretoria: "edita", pmo: "edita", area: "visualiza", controladoria: "visualiza", executor: "—" },
  },
  {
    screen: "Maturidade & Roadmap",
    path: "/maturidade",
    access: { diretoria: "visualiza", pmo: "edita", area: "visualiza", controladoria: "visualiza", executor: "—" },
  },
  {
    screen: "Execução",
    path: "/execucao",
    access: { diretoria: "visualiza", pmo: "edita", area: "edita", controladoria: "visualiza", executor: "edita" },
  },
  {
    screen: "Projetos & Submissão",
    path: "/projetos",
    access: { diretoria: "edita", pmo: "edita", area: "edita", controladoria: "visualiza", executor: "visualiza" },
  },
  {
    screen: "Parametrização",
    path: "/parametrizacao",
    access: { diretoria: "edita", pmo: "edita", area: "—", controladoria: "—", executor: "—" },
  },
  {
    screen: "Perfis & Acessos",
    path: "/perfis",
    access: { diretoria: "edita", pmo: "visualiza", area: "—", controladoria: "—", executor: "—" },
  },
  {
    screen: "App do Colaborador",
    path: "/colaborador",
    access: { diretoria: "—", pmo: "—", area: "—", controladoria: "—", executor: "edita" },
  },
];
