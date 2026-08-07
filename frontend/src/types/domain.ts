// Espelho dos tipos de domínio do backend (backend/src/types/domain.ts).
// Projeto sem monorepo/workspaces — mantido em sincronia manualmente por ser um protótipo.

export type VerticalId = "preparo-solo" | "plantio" | "pulverizacao" | "pecas";

export interface Vertical {
  id: VerticalId;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export type ProjectTypeId = "novo-produto" | "melhoria" | "inovacao" | "parceria-externa";

export interface ProjectType {
  id: ProjectTypeId;
  name: string;
  description: string;
  phaseCount: number;
}

export type FunnelStageId = "captacao" | "triagem" | "avaliacao" | "gate" | "execucao" | "encerrado";

export interface FunnelStage {
  id: FunnelStageId;
  name: string;
  description: string;
  order: number;
}

export type ProjectHealth = "on-track" | "attention" | "critical";

export interface ProjectScores {
  financeiro: number;
  mercado: number; // exibido como "Inovação & Diferenciação" no Eixo 1
  riscoTecnologico: number;
  aderenciaEstrategica: number;
  regulatorio: number;
  esg: number;
  operacional: number; // exibido como "Viabilidade Operacional" no Eixo 1
  complexidadeIndustrial: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  vertical: VerticalId;
  type: ProjectTypeId;
  funnelStage: FunnelStageId;
  trl: number;
  tirPercent: number;
  vplValueK: number;
  budgetK: number;
  spentK: number;
  scores: ProjectScores;
  priorityScoreDefault: number;
  health: ProjectHealth;
  spi: number | null;
  cpi: number | null;
  leaderId: string;
  sponsorId: string;
  startDate: string;
  targetDate: string;
  description: string;
  tags: string[];
}

export type PersonProfile = "diretoria" | "pmo" | "area" | "controladoria" | "executor";

export interface Person {
  id: string;
  name: string;
  role: string;
  profile: PersonProfile;
  vertical: VerticalId | null;
  dailyHours: number;
  avatarInitials: string;
}

export interface PlatformParameters {
  pointsPerHour: number;
  workingDaysPerMonth: number;
  currency: string;
}

export interface PortfolioHighlights {
  critical: Project[];
  topPriority: Project[];
}

export interface PortfolioSummary {
  total: number;
  byVertical: { vertical: VerticalId; count: number }[];
  byFunnelStage: { stage: FunnelStageId; count: number }[];
  avgTrl: number;
  avgTir: number;
  totalVplK: number;
  totalBudgetK: number;
  avgSpi: number;
  avgCpi: number;
  criticalCount: number;
  attentionCount: number;
  onTrackCount: number;
}

// ───────────────────── Eixo 3 — Execução ponta a ponta ─────────────────────
// A execução é organizada diretamente pelos 9 níveis de maturidade (TRL) do
// projeto. Cada "Phase" representa um nível TRL (1-9); concluir todas as
// micro-etapas de um nível é o que avança o projeto para o próximo.

export type PhaseStatus = "concluida" | "em-andamento" | "pendente";

export interface Phase {
  id: string;
  projectId: string;
  trlLevel: number; // 1-9
  name: string;
  status: PhaseStatus;
}

export type MicroStageStatus = "concluida" | "em-andamento" | "pendente";

export interface MicroStage {
  id: string;
  phaseId: string; // nível TRL ao qual esta micro-etapa pertence
  projectId: string;
  name: string;
  hours: number;
  points: number;
  status: MicroStageStatus;
  assigneeId: string | null;
  dueDate: string;
  completedDate: string | null;
}

export interface SCurvePoint {
  month: string;
  plannedPct: number;
  actualPct: number | null;
  projectedPct: number | null;
}

export interface StatusReport {
  projectId: string;
  period: string;
  spi: number;
  cpi: number;
  summary: string;
  risks: string;
  nextSteps: string;
}

export interface ProjectExecutionDetail {
  projectId: string;
  phases: Phase[]; // 9 níveis TRL
  microStages: MicroStage[];
  scurve: SCurvePoint[];
  statusReport: StatusReport;
}

export interface CapacitySummary {
  person: Person;
  monthlyCapacityPoints: number;
  pointsEarned: number;
  pointsCommitted: number;
  microStages: MicroStage[];
}

export interface CapacityResponse {
  currentMonth: string;
  summary: CapacitySummary[];
}

// Curva-S agregada de todo o portfólio em execução — eixo normalizado (%
// de prazo decorrido, 0-100) em vez de mês calendário, pois cada projeto
// tem datas de início/fim próprias.
export interface PortfolioScurvePoint {
  tPct: number; // 0-100, % do prazo decorrido (normalizado)
  plannedPct: number;
  actualPct: number | null;
  projectedPct: number | null;
}

export interface PortfolioScurve {
  points: PortfolioScurvePoint[];
  progressPct: number; // % médio de prazo decorrido entre os projetos em execução/encerrados — o "hoje" do gráfico
  avgSpi: number;
  projectCount: number;
}

export interface MonthlyExecutionTrendPoint {
  month: string; // "2026-03"
  pointsPlanned: number;
  pointsCompleted: number;
  completionRatePct: number;
}
