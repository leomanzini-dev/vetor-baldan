export interface TrlLevelDef {
  level: number; // 1-9
  title: string;
  description: string;
  requirements: string;
}

export type TrlBandId = "descoberta" | "validacao" | "escala";

export interface TrlBand {
  id: TrlBandId;
  label: string;
  levels: [number, number];
}

export const trlBands: TrlBand[] = [
  { id: "descoberta", label: "Descoberta", levels: [1, 3] },
  { id: "validacao", label: "Validação", levels: [4, 6] },
  { id: "escala", label: "Escala", levels: [7, 9] },
];

export function bandForTrl(trl: number): TrlBandId {
  if (trl <= 3) return "descoberta";
  if (trl <= 6) return "validacao";
  return "escala";
}

// Escala TRL adaptada ao contexto de metalomecânica agrícola da Baldan — valor
// "de fábrica". Totalmente editável em runtime (ver TrlScaleEditor / trlStore).
export const defaultTrlLevels: TrlLevelDef[] = [
  {
    level: 1,
    title: "Princípios Observados",
    description: "Conceito ou princípio técnico identificado a partir de uma necessidade de campo, sem validação prática.",
    requirements: "Registro da ideia e do princípio técnico subjacente.",
  },
  {
    level: 2,
    title: "Concepção Formulada",
    description: "Aplicação prática esboçada e hipóteses de engenharia formuladas — ainda sem qualquer teste.",
    requirements: "Memorial descritivo preliminar e hipóteses de engenharia registradas.",
  },
  {
    level: 3,
    title: "Prova de Conceito Analítica",
    description: "Primeiros testes de bancada ou simulação (CAE/CFD) validam o princípio isoladamente.",
    requirements: "Relatório de simulação ou ensaio de bancada com resultado positivo.",
  },
  {
    level: 4,
    title: "Validação em Ambiente Controlado",
    description: "Protótipo funcional testado em laboratório ou banco de provas, fora de condições de campo.",
    requirements: "Protótipo funcional + relatório de ensaio em banco de provas.",
  },
  {
    level: 5,
    title: "Validação em Ambiente Relevante",
    description: "Protótipo testado em condições simuladas de campo — solo controlado ou oficina piloto.",
    requirements: "Protótipo revisado + plano e relatório de teste em ambiente simulado.",
  },
  {
    level: 6,
    title: "Demonstração em Ambiente Relevante",
    description: "Protótipo avançado demonstrado em condições reais de operação agrícola, com acompanhamento técnico.",
    requirements: "Demonstração acompanhada em campo real, com relatório técnico de desempenho.",
  },
  {
    level: 7,
    title: "Demonstração Operacional",
    description: "Unidade piloto operando em campo de cliente ou parceiro, em escala real e condições reais de uso.",
    requirements: "Unidade piloto instalada + acordo de teste com cliente/parceiro.",
  },
  {
    level: 8,
    title: "Sistema Qualificado",
    description: "Produto finalizado, testado e homologado — pronto para produção em série.",
    requirements: "Homologação técnica concluída + processo produtivo validado.",
  },
  {
    level: 9,
    title: "Comprovado em Operação",
    description: "Produto em produção e comercialização plena, com histórico de uso consolidado no campo.",
    requirements: "Produção em série ativa + histórico de pós-venda acompanhado.",
  },
];
