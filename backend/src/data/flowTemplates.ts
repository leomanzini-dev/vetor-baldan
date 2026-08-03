import type { ProjectTypeId } from "../types/domain.js";

// Fluxo padrão por tipo de projeto: tipo → fases → etapas → micro-etapas.
// Ordem de grandeza alvo (projeto.md): ~6 fases, dezenas de etapas, ~87 micro-etapas
// no total do fluxo de um projeto completo (tipo Novo Produto / Inovação).

export const phaseNamesByType: Record<ProjectTypeId, string[]> = {
  "novo-produto": [
    "Ideação & Escopo",
    "Engenharia Conceitual",
    "Engenharia de Detalhamento",
    "Prototipagem & Testes",
    "Validação de Campo",
    "Industrialização & Lançamento",
  ],
  melhoria: ["Diagnóstico", "Engenharia da Solução", "Implementação & Testes", "Validação & Rollout"],
  inovacao: [
    "Exploração Tecnológica",
    "Prova de Conceito",
    "Engenharia de Protótipo",
    "Validação em Ambiente Relevante",
    "Piloto Operacional",
    "Transferência para Produto",
  ],
  "parceria-externa": [
    "Estruturação da Parceria",
    "Alinhamento Técnico Conjunto",
    "Desenvolvimento Colaborativo",
    "Validação Conjunta",
    "Transição & Encerramento",
  ],
};

// Pool de nomes de etapas — combinados ciclicamente para preencher cada fase.
export const stageNamePool = [
  "Levantamento de Requisitos",
  "Definição de Especificações Técnicas",
  "Desenho e Modelamento 3D",
  "Análise Estrutural (CAE)",
  "Seleção de Materiais e Componentes",
  "Fabricação de Protótipo",
  "Ensaio de Bancada",
  "Ensaio de Campo",
  "Ajustes de Engenharia",
  "Documentação Técnica",
  "Análise de Custo e Viabilidade",
  "Revisão de Gate",
  "Homologação de Fornecedores",
  "Plano de Manufatura",
  "Treinamento de Equipe Técnica",
];

// Pool de micro-etapas — a unidade mínima de trabalho, onde horas/pontos operam.
export const microStageNamePool = [
  "Elaborar desenho técnico 2D",
  "Revisar tolerâncias dimensionais",
  "Solicitar cotação de matéria-prima",
  "Executar simulação estrutural",
  "Registrar resultado em relatório técnico",
  "Montar protótipo em bancada",
  "Instrumentar protótipo para ensaio",
  "Executar ensaio funcional",
  "Analisar dados do ensaio",
  "Ajustar parâmetros de projeto",
  "Revisar desenho com equipe",
  "Atualizar lista de materiais (BOM)",
  "Validar interface com componente existente",
  "Preparar unidade para teste de campo",
  "Acompanhar teste em campo",
  "Coletar feedback do operador",
  "Consolidar relatório de ensaio",
  "Revisar especificação com fornecedor",
  "Emitir desenho para fabricação",
  "Inspecionar peça recebida",
  "Atualizar documentação de engenharia",
  "Preparar apresentação de gate",
  "Revisar análise de custo",
  "Validar plano de manufatura",
  "Registrar não conformidade",
  "Propor ação corretiva",
];
