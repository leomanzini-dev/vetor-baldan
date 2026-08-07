import type {
  FunnelStageId,
  Project,
  ProjectHealth,
  ProjectScores,
  ProjectTypeId,
  VerticalId,
} from "../types/domain.js";
import { people } from "./people.js";

// PRNG determinístico (mulberry32) — garante que o portfólio mock seja sempre
// o mesmo entre reinícios do servidor, sem precisar persistir nada em disco.
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240914);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickWeighted<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  const v = rand() * (max - min) + min;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

// ───────────────────── vocabulário por vertical ─────────────────────

const verticalMeta: Record<
  VerticalId,
  { prefix: string; products: string[]; descriptors: string[]; techWords: string[] }
> = {
  "preparo-solo": {
    prefix: "PS",
    products: [
      "Grade Aradora",
      "Subsolador",
      "Arado de Discos",
      "Escarificador",
      "Grade Niveladora",
      "Rolo Compactador",
      "Grade Intermediária",
      "Sulcador de Base",
    ],
    descriptors: ["de Precisão", "Modular", "de Alto Rendimento", "Autoajustável", "Reforçado", "Compacto"],
    techWords: [
      "Sensor de Profundidade de Solo",
      "Controle Hidráulico Automático",
      "Monitoramento de Compactação IoT",
      "Discos em Aço de Alta Dureza",
      "Sistema Antivibração",
    ],
  },
  plantio: {
    prefix: "PL",
    products: [
      "Semeadora-Adubadora",
      "Plantadeira de Precisão",
      "Dosador Pneumático",
      "Sistema de Corte de Palha",
      "Distribuidor de Sementes",
      "Sulcador de Linha",
      "Unidade Plantadora",
    ],
    descriptors: ["de Precisão", "Modular", "para Plantio Direto", "de Alta Velocidade", "Multilinha"],
    techWords: [
      "Sensor de População de Plantas",
      "Controle de Taxa Variável",
      "Monitor de Distribuição por Linha",
      "Piloto de Profundidade Automático",
      "Telemetria de Plantio",
    ],
  },
  pulverizacao: {
    prefix: "PV",
    products: [
      "Pulverizador Autopropelido",
      "Barra de Pulverização",
      "Pulverizador de Arrasto",
      "Sistema de Bicos",
      "Barra Dobrável",
      "Tanque de Calda",
    ],
    descriptors: ["de Precisão", "de Longo Alcance", "Autonivelante", "de Alta Vazão", "Modular"],
    techWords: [
      "Piloto Automático de Aplicação",
      "Controle de Deriva",
      "Taxa Variável por GPS",
      "Sensor de Vento Embarcado",
      "Corte Individual de Bico",
    ],
  },
  pecas: {
    prefix: "PC",
    products: [
      "Kit de Reposição",
      "Disco de Corte",
      "Rolamento Selado",
      "Linha de Facas",
      "Ponteira de Desgaste",
      "Mancal Reforçado",
      "Kit de Manutenção",
    ],
    descriptors: ["de Alta Durabilidade", "Padronizado", "Universal", "de Longa Vida Útil", "Reforçado"],
    techWords: [
      "Catálogo Inteligente de Peças",
      "Previsão de Vida Útil",
      "Rastreabilidade de Componentes",
      "Recomendação Automática de Reposição",
    ],
  },
};

const typeWeights: Record<ProjectTypeId, number> = {
  melhoria: 40,
  "novo-produto": 25,
  inovacao: 25,
  "parceria-externa": 10,
};

// "Execução" fica de fora do sorteio ponderado — um time real não sustenta
// dezenas de projetos em execução simultânea, então o número de projetos
// executando é fixado (EXECUTION_COUNT) e sorteado à parte; o restante do
// portfólio se distribui pelos demais estágios do funil com estes pesos.
const nonExecutionFunnelWeights: Record<Exclude<FunnelStageId, "execucao">, number> = {
  captacao: 22,
  triagem: 18,
  avaliacao: 16,
  gate: 10,
  encerrado: 8,
};

const EXECUTION_COUNT = 5;

// Perfis de risco deliberados para os projetos fixados em execução — uma
// amostra puramente aleatória tende a repetir o mesmo tipo de problema (ex.:
// todos com CPI baixo), o que não ilustra bem a Análise de Projetos. Cada um
// dos 5 usa um arquétipo diferente: atraso de cronograma, estouro de custo,
// atenção leve nos dois índices, TRL estagnado frente ao prazo, e saudável.
interface ExecutionArchetype {
  spi: number;
  cpi: number;
  trl: number;
  progressFactor: number;
}

const executionArchetypes: ExecutionArchetype[] = [
  { spi: 0.72, cpi: 0.95, trl: 6, progressFactor: 0.55 },
  { spi: 0.96, cpi: 0.7, trl: 6, progressFactor: 0.6 },
  { spi: 0.9, cpi: 0.92, trl: 5, progressFactor: 0.45 },
  { spi: 0.94, cpi: 0.93, trl: 3, progressFactor: 0.7 },
  { spi: 1.05, cpi: 1.02, trl: 7, progressFactor: 0.5 },
];

function buildName(vertical: VerticalId, type: ProjectTypeId): string {
  const meta = verticalMeta[vertical];
  const product = pick(meta.products);
  // evita redundância tipo "Plantadeira de Precisão de Precisão" quando o
  // produto sorteado já contém o texto do descritor sorteado
  const availableDescriptors = meta.descriptors.filter((d) => !product.includes(d));
  const descriptor = pick(availableDescriptors.length > 0 ? availableDescriptors : meta.descriptors);
  const tech = pick(meta.techWords);

  switch (type) {
    case "novo-produto":
      return `Nova Linha de ${product} ${descriptor}`;
    case "melhoria":
      return `Otimização de ${product} ${descriptor}`;
    case "inovacao":
      return `${tech} para ${product}`;
    case "parceria-externa":
      return `Codesenvolvimento: ${tech} Aplicado a ${product}`;
  }
}

// TRL: mais avançado quanto mais adiante no funil
function trlForStage(stage: FunnelStageId): number {
  switch (stage) {
    case "captacao":
      return randInt(1, 2);
    case "triagem":
      return randInt(2, 3);
    case "avaliacao":
      return randInt(3, 4);
    case "gate":
      return randInt(4, 5);
    case "execucao":
      return randInt(5, 8);
    case "encerrado":
      return randInt(8, 9);
  }
}

function healthFromIndices(spi: number | null, cpi: number | null): ProjectHealth {
  if (spi === null || cpi === null) return "on-track";
  const worst = Math.min(spi, cpi);
  if (worst < 0.85) return "critical";
  if (worst < 0.97) return "attention";
  return "on-track";
}

function buildScores(riskBias: number): ProjectScores {
  return {
    financeiro: randInt(35, 95),
    mercado: randInt(30, 95),
    riscoTecnologico: clamp(randInt(30, 95) - riskBias, 10, 98),
    aderenciaEstrategica: randInt(40, 98),
    regulatorio: randInt(50, 99),
    esg: randInt(40, 95),
    operacional: randInt(35, 95),
    complexidadeIndustrial: randInt(30, 95),
  };
}

function weightedAverage(scores: ProjectScores): number {
  // pesos default de referência (o Eixo 1 permite reponderar livremente)
  const weights = {
    financeiro: 0.2,
    mercado: 0.15,
    riscoTecnologico: 0.15,
    aderenciaEstrategica: 0.2,
    regulatorio: 0.05,
    esg: 0.1,
    operacional: 0.1,
    complexidadeIndustrial: 0.05,
  };
  const total = (Object.keys(weights) as (keyof ProjectScores)[]).reduce(
    (sum, key) => sum + scores[key] * weights[key],
    0
  );
  return Math.round(total * 10) / 10;
}

const descriptionTemplates = [
  "Iniciativa avaliada dentro do fluxo padrão de governança de portfólio, com acompanhamento pela área responsável.",
  "Projeto priorizado a partir de demanda identificada em campo, com potencial de diferenciação competitiva.",
  "Iniciativa vinculada à estratégia de eficiência produtiva e redução de custo operacional.",
  "Projeto com forte componente tecnológico, avaliado quanto à maturidade e viabilidade de escala.",
  "Demanda originada por feedback de rede de distribuidores e assistência técnica.",
  "Projeto estruturado para atender exigência regulatória ou requisito de mercado emergente.",
];

const tagsByType: Record<ProjectTypeId, string[]> = {
  "novo-produto": ["novo produto", "plataforma"],
  melhoria: ["melhoria contínua", "eficiência"],
  inovacao: ["inovação", "tecnologia embarcada"],
  "parceria-externa": ["parceria", "codesenvolvimento", "ICT"],
};

export function generateProjects(count = 180): Project[] {
  const now = new Date();
  const verticalIds: VerticalId[] = ["preparo-solo", "plantio", "pulverizacao", "pecas"];
  const leadersAndSponsors = people.filter((p) => p.profile === "executor" || p.profile === "area");
  const sponsors = people.filter((p) => p.profile === "area" || p.profile === "diretoria");

  const counters: Record<VerticalId, number> = {
    "preparo-solo": 0,
    plantio: 0,
    pulverizacao: 0,
    pecas: 0,
  };

  const projects: Project[] = [];

  const executionIndices = new Set<number>();
  while (executionIndices.size < Math.min(EXECUTION_COUNT, count)) {
    executionIndices.add(Math.floor(rand() * count));
  }
  let executionSlot = 0;

  for (let i = 0; i < count; i++) {
    const vertical = verticalIds[i % verticalIds.length];
    counters[vertical] += 1;
    const type = pickWeighted(typeWeights);
    const funnelStage: FunnelStageId = executionIndices.has(i) ? "execucao" : pickWeighted(nonExecutionFunnelWeights);
    let trl = trlForStage(funnelStage);

    const isExecuting = funnelStage === "execucao" || funnelStage === "encerrado";
    let spi = isExecuting ? randFloat(0.75, 1.15, 2) : null;
    let cpi = isExecuting ? randFloat(0.75, 1.15, 2) : null;

    const budgetK = randInt(120, 4200);
    let progressFactor = funnelStage === "encerrado" ? 1 : funnelStage === "execucao" ? randFloat(0.15, 0.9, 2) : 0;

    if (funnelStage === "execucao") {
      const archetype = executionArchetypes[executionSlot % executionArchetypes.length];
      executionSlot += 1;
      spi = archetype.spi;
      cpi = archetype.cpi;
      trl = archetype.trl;
      progressFactor = archetype.progressFactor;
    }

    const spentK = Math.round(budgetK * progressFactor * (cpi ? 1 / cpi : 1));

    const riskBias = 9 - trl; // TRL mais baixo => mais risco tecnológico
    const scores = buildScores(riskBias * 4);

    const durationMonths = randInt(6, 30);
    let startDate: Date;
    let targetDate: Date;
    if (funnelStage === "execucao") {
      // "Agora" cai dentro de [start, target], aproximadamente na fração já
      // executada (progressFactor) — mantém cronograma e progresso coerentes.
      const elapsedMonths = Math.round(progressFactor * durationMonths);
      startDate = addMonths(now, -elapsedMonths);
      targetDate = addMonths(startDate, durationMonths);
    } else if (funnelStage === "encerrado") {
      targetDate = addMonths(now, -randInt(1, 18));
      startDate = addMonths(targetDate, -durationMonths);
    } else {
      // Ainda no funil pré-execução: proposto recentemente, com entrega planejada à frente.
      startDate = addMonths(now, -randInt(0, 4));
      targetDate = addMonths(startDate, durationMonths);
    }

    const leader = pick(leadersAndSponsors.filter((p) => p.vertical === vertical || p.vertical === null));
    const sponsor = pick(sponsors);

    const code = `${verticalMeta[vertical].prefix}-${String(counters[vertical]).padStart(3, "0")}`;

    projects.push({
      id: `proj-${code.toLowerCase()}`,
      code,
      name: buildName(vertical, type),
      vertical,
      type,
      funnelStage,
      trl,
      tirPercent: randFloat(-5, 42, 1),
      vplValueK: randInt(-800, 9000),
      budgetK,
      spentK,
      scores,
      priorityScoreDefault: weightedAverage(scores),
      health: healthFromIndices(spi, cpi),
      spi,
      cpi,
      leaderId: leader?.id ?? "p-exec-01",
      sponsorId: sponsor?.id ?? "p-diretoria-1",
      startDate: startDate.toISOString().slice(0, 10),
      targetDate: targetDate.toISOString().slice(0, 10),
      description: pick(descriptionTemplates),
      tags: tagsByType[type],
    });
  }

  return projects;
}
