import type { ProjectType } from "../types/domain.js";

export const projectTypes: ProjectType[] = [
  {
    id: "novo-produto",
    name: "Novo Produto",
    description: "Desenvolvimento de linha ou plataforma inteiramente nova, do zero.",
    phaseCount: 6,
  },
  {
    id: "melhoria",
    name: "Melhoria",
    description: "Evolução incremental de produto ou processo já existente no portfólio.",
    phaseCount: 4,
  },
  {
    id: "inovacao",
    name: "Inovação",
    description: "Exploração tecnológica com maior incerteza — sensoriamento, automação, IoT.",
    phaseCount: 6,
  },
  {
    id: "parceria-externa",
    name: "Parceria Externa",
    description: "Codesenvolvimento com ICTs, startups ou fornecedores estratégicos.",
    phaseCount: 5,
  },
];
