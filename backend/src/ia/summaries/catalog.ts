// Catálogo de sumários disponíveis para a IA.
// Cada sumário descreve um módulo do VETOR e é carregado sob demanda.

export interface SummaryEntry {
  id: string;
  label: string;
  description: string;
  keywords: string[];
}

export const summaryCatalog: SummaryEntry[] = [
  {
    id: "VISAO_GERAL",
    label: "Visão Geral do Portfólio",
    description: "KPIs globais: total de projetos, TIR média, VPL total, TRL médio, saúde da execução, distribuição por vertical e funil.",
    keywords: ["visao geral", "resumo", "portfolio", "kpi", "indicador", "quantos projetos", "total", "overview"],
  },
  {
    id: "PRIORIZACAO",
    label: "Priorização Multicritério",
    description: "Ranking dos projetos por score ponderado das 8 lentes, faixas de prioridade (prioritário/alto/médio/baixo), líder do ranking, score médio.",
    keywords: ["priorizacao", "ranking", "prioridade", "lente", "peso", "score", "multicritério", "prioritario", "qual projeto"],
  },
  {
    id: "MATURIDADE",
    label: "Maturidade Tecnológica (TRL)",
    description: "Distribuição dos projetos por nível TRL 1-9, roadmap por ano e faixa (descoberta/validação/escala), próximos projetos a escalar.",
    keywords: ["maturidade", "trl", "tecnologia", "roadmap", "escala", "validacao", "descoberta", "nivel"],
  },
  {
    id: "EXECUCAO",
    label: "Execução e Capacidade",
    description: "Projetos em execução com SPI/CPI, curva-S, capacidade mensal por executor, micro-etapas do mês, sobrecarga.",
    keywords: ["execucao", "spi", "cpi", "capacidade", "executor", "micro-etapa", "entrega", "prazo", "atraso", "curva"],
  },
  {
    id: "PROJETOS",
    label: "Catálogo de Projetos",
    description: "Lista completa dos projetos com código, nome, vertical, tipo, funil, TIR, VPL, orçamento, TRL, saúde, líder e sponsor.",
    keywords: ["projeto", "catalogo", "lista", "detalhe", "busca", "codigo", "nome", "vertical"],
  },
  {
    id: "EQUIPE",
    label: "Equipe e Perfis",
    description: "Os 29 membros do time: diretoria, PMO, gestores de área, controladoria e executores, com carga horária e vertical.",
    keywords: ["equipe", "pessoa", "time", "executor", "pmo", "diretoria", "quem", "responsavel", "lider"],
  },
];
