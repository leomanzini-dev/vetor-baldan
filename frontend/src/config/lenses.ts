import type { ComponentType } from "react";
import { Coins, LineChart, ShieldAlert, Compass, Scale, Leaf, Cog } from "lucide-react";
import type { ProjectScores } from "@/types/domain";

export type LensId = keyof ProjectScores;

export interface LensDef {
  id: LensId;
  label: string;
  short: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export const lensDefs: LensDef[] = [
  {
    id: "financeiro",
    label: "Financeiro",
    short: "Financeiro",
    description: "Retorno esperado — combina TIR e VPL do projeto.",
    icon: Coins,
  },
  {
    id: "mercado",
    label: "Potencial de Mercado",
    short: "Mercado",
    description: "Demanda estimada e diferenciação competitiva.",
    icon: LineChart,
  },
  {
    id: "riscoTecnologico",
    label: "Risco Tecnológico",
    short: "Risco Tec.",
    description: "Maturidade e incerteza técnica — nota maior é menos arriscado.",
    icon: ShieldAlert,
  },
  {
    id: "aderenciaEstrategica",
    label: "Aderência Estratégica",
    short: "Aderência",
    description: "Alinhamento com a estratégia corporativa e os 4 P's.",
    icon: Compass,
  },
  {
    id: "regulatorio",
    label: "Regulatório",
    short: "Regulatório",
    description: "Exposição a exigências normativas e de compliance.",
    icon: Scale,
  },
  {
    id: "esg",
    label: "ESG",
    short: "ESG",
    description: "Impacto ambiental, social e de governança.",
    icon: Leaf,
  },
  {
    id: "operacional",
    label: "Operacional",
    short: "Operacional",
    description: "Complexidade de implantação e escalabilidade produtiva.",
    icon: Cog,
  },
];

// Espelha os pesos default usados no backend (generateProjects.ts → weightedAverage)
// para que "Padrão Baldan" reproduza exatamente o priorityScoreDefault de cada projeto.
export const defaultWeights: Record<LensId, number> = {
  financeiro: 25,
  mercado: 15,
  riscoTecnologico: 15,
  aderenciaEstrategica: 20,
  regulatorio: 5,
  esg: 10,
  operacional: 10,
};

export interface WeightPreset {
  id: string;
  label: string;
  description: string;
  weights: Record<LensId, number>;
}

export const weightPresets: WeightPreset[] = [
  {
    id: "padrao",
    label: "Padrão Baldan",
    description: "Configuração de referência, equilibrada entre os sete critérios.",
    weights: defaultWeights,
  },
  {
    id: "financeiro",
    label: "Foco Financeiro",
    description: "Prioriza retorno — TIR e VPL pesam mais que os demais critérios.",
    weights: {
      financeiro: 40,
      mercado: 20,
      riscoTecnologico: 10,
      aderenciaEstrategica: 15,
      regulatorio: 5,
      esg: 5,
      operacional: 5,
    },
  },
  {
    id: "estrategico",
    label: "Foco Estratégico",
    description: "Prioriza projetos mais alinhados à direção de longo prazo da Baldan.",
    weights: {
      financeiro: 15,
      mercado: 15,
      riscoTecnologico: 10,
      aderenciaEstrategica: 35,
      regulatorio: 5,
      esg: 10,
      operacional: 10,
    },
  },
  {
    id: "esg-regulatorio",
    label: "Foco ESG & Regulatório",
    description: "Prioriza conformidade normativa e impacto socioambiental.",
    weights: {
      financeiro: 15,
      mercado: 10,
      riscoTecnologico: 10,
      aderenciaEstrategica: 15,
      regulatorio: 20,
      esg: 25,
      operacional: 5,
    },
  },
];
