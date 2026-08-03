import type { ProjectScores, ProjectTypeId, VerticalId } from "@/types/domain";

// Simulação leve de "IA" de enquadramento — heurísticas determinísticas sobre o
// texto da submissão. Não há modelo real: é a camada interpretativa do
// protótipo, sempre editável pelo usuário antes de confirmar o cadastro.

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seededRand(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return (s >>> 8) / 0xffffff;
  };
}

const verticalKeywords: Record<VerticalId, string[]> = {
  "preparo-solo": ["solo", "grade", "arado", "subsolador", "escarificador", "compact", "descompact"],
  plantio: ["plantio", "semeadora", "plantadeira", "semente", "dosagem", "sulcador", "distribuidor"],
  pulverizacao: ["pulveriz", "bico", "barra", "deriva", "calda", "aplicação", "taxa variável"],
  pecas: ["peça", "peças", "reposição", "desgaste", "rolamento", "disco de corte", "manutenção", "catálogo"],
};

const typeKeywords: Record<ProjectTypeId, string[]> = {
  "novo-produto": ["nova linha", "novo produto", "lançamento", "plataforma nova", "do zero"],
  melhoria: ["melhoria", "otimiz", "ajuste", "redução de custo", "eficiência", "incremental"],
  inovacao: ["sensor", "iot", "inteligente", "automátic", "autônomo", "inteligência artificial", "telemetria", "digital"],
  "parceria-externa": ["parceria", "parceiro", "ict", "universidade", "startup", "codesenvolvimento", "fornecedor externo"],
};

function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0);
}

export function inferVertical(text: string): VerticalId {
  const scores = (Object.keys(verticalKeywords) as VerticalId[]).map((v) => ({
    v,
    score: scoreKeywords(text, verticalKeywords[v]),
  }));
  const best = scores.sort((a, b) => b.score - a.score)[0];
  if (best.score === 0) {
    const order: VerticalId[] = ["preparo-solo", "plantio", "pulverizacao", "pecas"];
    return order[hash(text) % order.length];
  }
  return best.v;
}

export function inferType(text: string): ProjectTypeId {
  const scores = (Object.keys(typeKeywords) as ProjectTypeId[]).map((t) => ({
    t,
    score: scoreKeywords(text, typeKeywords[t]),
  }));
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.score === 0 ? "melhoria" : best.t;
}

export function inferTrl(text: string): number {
  const lower = text.toLowerCase();
  if (/produção|comercial|lançado|escala/.test(lower)) return 7;
  if (/piloto|campo real|teste de campo/.test(lower)) return 6;
  if (/protótipo|prova de conceito|bancada/.test(lower)) return 4;
  if (/conceito|ideia|estudo/.test(lower)) return 2;
  return 3;
}

export function inferScores(name: string, description: string, tirPercent: number, vplValueK: number): ProjectScores {
  const rand = seededRand(hash(name + description));
  const text = `${name} ${description}`;

  const financeiroFromTir = Math.max(0, Math.min(100, (tirPercent / 35) * 100));
  const financeiroFromVpl = Math.max(0, Math.min(100, ((vplValueK + 800) / (9000 + 800)) * 100));
  const financeiro = Math.round((financeiroFromTir * 0.6 + financeiroFromVpl * 0.4));

  const mercado = Math.round(45 + scoreKeywords(text, ["mercado", "demanda", "cliente", "concorrência", "diferencia"]) * 10 + rand() * 20);
  const trl = inferTrl(text);
  const riscoTecnologico = Math.round(Math.min(95, trl * 9 + rand() * 15));
  const aderenciaEstrategica = Math.round(55 + scoreKeywords(text, ["estratég", "portfólio", "prioridade", "4 p"]) * 10 + rand() * 20);
  const regulatorio = Math.round(55 + rand() * 30);
  const esg = Math.round(50 + scoreKeywords(text, ["sustentáv", "esg", "ambient", "energia", "emissão"]) * 12 + rand() * 20);
  const operacional = Math.round(50 + rand() * 30);

  const clamp = (v: number) => Math.max(10, Math.min(98, v));

  return {
    financeiro: clamp(financeiro),
    mercado: clamp(mercado),
    riscoTecnologico: clamp(riscoTecnologico),
    aderenciaEstrategica: clamp(aderenciaEstrategica),
    regulatorio: clamp(regulatorio),
    esg: clamp(esg),
    operacional: clamp(operacional),
  };
}

const narrativeTemplates = [
  (vertical: string, rank: number, total: number) =>
    `Com os critérios e pesos atuais, esta ideia se posicionaria por volta do lugar ${rank} de ${total} no ranking do portfólio — competitiva dentro da vertical de ${vertical}.`,
  (vertical: string, rank: number, total: number) =>
    `A estimativa inicial da IA posiciona esta submissão perto da posição ${rank} entre ${total} projetos ativos, um resultado sólido para a vertical de ${vertical}.`,
];

export function buildIntakeNarrative(vertical: string, rank: number, total: number): string {
  const idx = (rank + total) % narrativeTemplates.length;
  return narrativeTemplates[idx](vertical, rank, total);
}
