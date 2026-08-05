// Modelo de domínio da plataforma VETOR (Baldan).
// Todos os dados que implementam estas formas são mock/fixture — nenhuma persistência real.

export type VerticalId = "preparo-solo" | "plantio" | "pulverizacao" | "pecas";

export interface Vertical {
  id: VerticalId;
  name: string;
  shortName: string;
  description: string;
  color: string; // token semântico usado nos gráficos
}

export type ProjectTypeId = "novo-produto" | "melhoria" | "inovacao" | "parceria-externa";

export interface ProjectType {
  id: ProjectTypeId;
  name: string;
  description: string;
  phaseCount: number; // quantidade de fases do fluxo deste tipo
}

export type FunnelStageId =
  | "captacao"
  | "triagem"
  | "avaliacao"
  | "gate"
  | "execucao"
  | "encerrado";

export interface FunnelStage {
  id: FunnelStageId;
  name: string;
  description: string;
  order: number;
}

export type ProjectHealth = "on-track" | "attention" | "critical";

export interface ProjectScores {
  financeiro: number; // 0-100
  mercado: number; // exibido como "Inovação & Diferenciação" no Eixo 1
  riscoTecnologico: number; // maior = menor risco (escala normalizada)
  aderenciaEstrategica: number;
  regulatorio: number;
  esg: number;
  operacional: number; // exibido como "Viabilidade Operacional" no Eixo 1
  complexidadeIndustrial: number; // impacto em processo produtivo, ferramental e treinamento
}

export interface Project {
  id: string;
  code: string; // ex: PS-014
  name: string;
  vertical: VerticalId;
  type: ProjectTypeId;
  funnelStage: FunnelStageId;
  trl: number; // 1-9
  tirPercent: number; // TIR
  vplValueK: number; // VPL em milhares de R$
  budgetK: number; // orçamento total em milhares de R$
  spentK: number; // consumido até o momento
  scores: ProjectScores;
  priorityScoreDefault: number; // 0-100, calculado com pesos default (referência, recalculável no Eixo 1)
  health: ProjectHealth;
  spi: number | null; // Schedule Performance Index — só existe a partir da execução
  cpi: number | null; // Cost Performance Index
  leaderId: string;
  sponsorId: string;
  startDate: string; // ISO
  targetDate: string; // ISO
  description: string;
  tags: string[];
}

export type PersonProfile = "diretoria" | "pmo" | "area" | "controladoria" | "executor";

export interface Person {
  id: string;
  name: string;
  role: string;
  profile: PersonProfile;
  vertical: VerticalId | null; // null = corporativo/transversal
  dailyHours: number; // horas de trabalho por dia
  avatarInitials: string;
}

export interface PlatformParameters {
  pointsPerHour: number; // conversão hora → ponto
  workingDaysPerMonth: number;
  currency: string;
}

// ───────────────────── Eixo 3 — Execução ponta a ponta ─────────────────────

export type PhaseStatus = "concluida" | "em-andamento" | "pendente";

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  order: number;
  status: PhaseStatus;
}

export type StageStatus = "concluida" | "em-andamento" | "pendente";

export interface Stage {
  id: string;
  phaseId: string;
  projectId: string;
  name: string;
  order: number;
  status: StageStatus;
}

export type MicroStageStatus = "concluida" | "em-andamento" | "pendente";

export interface MicroStage {
  id: string;
  stageId: string;
  projectId: string;
  name: string;
  hours: number;
  points: number; // hours * pointsPerHour
  status: MicroStageStatus;
  assigneeId: string | null;
  dueDate: string; // ISO — dentro do mês corrente para o quadro de capacidade
  completedDate: string | null;
}

export interface SCurvePoint {
  month: string; // "2026-03"
  plannedPct: number; // 0-100, acumulado
  actualPct: number | null; // null a partir do mês corrente (ainda não ocorreu)
  projectedPct: number | null; // preenchido a partir do mês corrente em diante
}

export interface StatusReport {
  projectId: string;
  period: string; // "2026-08"
  spi: number;
  cpi: number;
  summary: string;
  risks: string;
  nextSteps: string;
}

export interface ProjectExecutionDetail {
  projectId: string;
  phases: Phase[];
  stages: Stage[];
  microStages: MicroStage[];
  scurve: SCurvePoint[];
  statusReport: StatusReport;
}

export interface CapacitySummary {
  person: Person;
  monthlyCapacityPoints: number;
  pointsEarned: number;
  pointsCommitted: number; // earned + pendentes/em-andamento
  microStages: MicroStage[];
}
