import type {
  MicroStage,
  MicroStageStatus,
  Phase,
  PhaseStatus,
  Project,
  ProjectExecutionDetail,
  SCurvePoint,
  StatusReport,
} from "../types/domain.js";
import { microStageNamePool } from "./flowTemplates.js";
import { people } from "./people.js";
import { platformParameters } from "./parameters.js";

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

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function timeProgressFraction(project: Project, now: Date): number {
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.targetDate).getTime();
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (now.getTime() - start) / (end - start)));
}

const executors = people.filter((p) => p.profile === "executor");
const TRL_LEVELS = 9;
const MS_PER_DAY = 86_400_000;

// Estrutura de execução ancorada no TRL atual do projeto (project.trl), não
// no tempo de calendário: níveis abaixo do atual já foram concluídos
// (histórico, distribuído nos meses anteriores para alimentar a tendência
// mensal); o nível atual está em andamento (micro-etapas espalhadas pelo mês
// corrente, mistura de concluída/em-andamento/pendente); níveis futuros ainda
// não têm micro-etapas — cabe ao gestor criá-las em Parametrização quando o
// projeto chegar lá.
function buildStructure(project: Project, now: Date, rand: () => number): { phases: Phase[]; microStages: MicroStage[] } {
  const currentTrl = Math.min(Math.max(Math.round(project.trl), 1), TRL_LEVELS);
  const phases: Phase[] = [];
  const microStages: MicroStage[] = [];
  const vertical = executors.filter((p) => p.vertical === project.vertical || p.vertical === null);
  const pool = vertical.length > 0 ? vertical : executors;
  // Um projeto tem, por padrão, UM responsável (todas as micro-etapas geradas
  // caem na mesma pessoa) — só passa a ter mais de um se o gestor atribuir
  // manualmente uma micro-etapa extra a outra pessoa em Parametrização.
  const projectAssignee = pick(rand, pool);

  for (let level = 1; level <= TRL_LEVELS; level++) {
    const phaseId = `${project.id}-trl${level}`;
    const phaseStatus: PhaseStatus =
      level < currentTrl ? "concluida" : level === currentTrl ? (currentTrl >= TRL_LEVELS ? "concluida" : "em-andamento") : "pendente";

    phases.push({ id: phaseId, projectId: project.id, trlLevel: level, name: `TRL ${level}`, status: phaseStatus });

    if (level > currentTrl) continue; // nível futuro — sem micro-etapas ainda

    const microCount = randInt(rand, 3, 6);
    const monthsBack = currentTrl - level;

    for (let m = 0; m < microCount; m++) {
      const microId = `${phaseId}-mc${m + 1}`;
      const microName = pick(rand, microStageNamePool);
      const hours = randInt(rand, 2, 16);

      let dueDate: Date;
      let status: MicroStageStatus;
      let completedDate: string | null;

      if (level < currentTrl) {
        // nível já concluído no passado — distribui em torno de N meses atrás,
        // alimentando a tendência mensal de execução com histórico real
        const base = addMonths(now, -monthsBack);
        const jitterDays = randInt(rand, -10, 10);
        dueDate = new Date(base.getTime() + jitterDays * MS_PER_DAY);
        status = "concluida";
        completedDate = toISODate(dueDate);
      } else {
        // nível corrente — espalhado pelo mês em curso, mistura realista de status
        const dayOffset = randInt(rand, -12, 18);
        dueDate = new Date(now.getTime() + dayOffset * MS_PER_DAY);
        const isPast = dueDate.getTime() <= now.getTime();
        if (isPast) {
          status = rand() < 0.75 ? "concluida" : "em-andamento";
        } else {
          status = rand() < 0.25 ? "em-andamento" : "pendente";
        }
        completedDate = status === "concluida" ? toISODate(dueDate) : null;
      }

      microStages.push({
        id: microId,
        phaseId,
        projectId: project.id,
        name: microName,
        hours,
        points: hours * platformParameters.pointsPerHour,
        status,
        assigneeId: projectAssignee.id,
        dueDate: toISODate(dueDate),
        completedDate,
      });
    }
  }

  return { phases, microStages };
}

function monthsBetween(project: Project): number {
  const start = new Date(project.startDate);
  const end = new Date(project.targetDate);
  return Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
}

function buildSCurve(project: Project, now: Date, rand: () => number): SCurvePoint[] {
  const start = new Date(project.startDate);
  const end = new Date(project.targetDate);
  const totalMonths = monthsBetween(project);
  const points: SCurvePoint[] = [];

  const spi = project.spi ?? 1;

  for (let i = 0; i <= totalMonths; i++) {
    const monthDate = addMonths(start, i);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    // curva planejada em S: lenta no início, acelera no meio, desacelera no fim
    const t = i / totalMonths;
    const plannedPct = sCurve(t) * 100;

    const isPast = monthDate <= now;
    const isFuture = monthDate > now;

    let actualPct: number | null = null;
    let projectedPct: number | null = null;

    if (isPast) {
      // real segue o planejado modulado pelo SPI (SPI < 1 = atrasado, executou menos que o planejado)
      const noise = (rand() - 0.5) * 4;
      actualPct = Math.max(0, Math.min(100, plannedPct * spi + noise));
    }
    if (isFuture || monthDate.getTime() === now.getTime()) {
      // projeção: extrapola a tendência atual (mesmo ritmo de SPI) até o fim
      projectedPct = Math.max(0, Math.min(100, plannedPct * spi));
    }

    points.push({ month: monthKey, plannedPct: Math.round(plannedPct * 10) / 10, actualPct: actualPct !== null ? Math.round(actualPct * 10) / 10 : null, projectedPct: projectedPct !== null ? Math.round(projectedPct * 10) / 10 : null });
  }

  return points;
}

export function sCurve(t: number): number {
  // logística suave 0→1
  const k = 8;
  return 1 / (1 + Math.exp(-k * (t - 0.5)));
}

const summaryTemplates = {
  "on-track": [
    "Projeto dentro do planejado, sem desvios relevantes de prazo ou custo neste período.",
    "Execução estável — entregas do período concluídas conforme cronograma.",
  ],
  attention: [
    "Leve desvio de prazo identificado no período — equipe já mapeou ações de recuperação.",
    "Consumo orçamentário levemente acima do previsto; acompanhamento reforçado nas próximas semanas.",
  ],
  critical: [
    "Desvio relevante de prazo/custo no período — replanejamento em curso com a liderança da área.",
    "Indicadores abaixo do limite aceitável; risco de impacto na data de entrega caso não haja ação corretiva.",
  ],
};

const risksTemplates = {
  "on-track": "Nenhum risco crítico em aberto no momento.",
  attention: "Disponibilidade de bancada de testes compartilhada pode gerar filas nas próximas semanas.",
  critical: "Dependência de fornecedor externo com histórico de atraso pode comprometer o próximo marco.",
};

function buildStatusReport(project: Project, now: Date, rand: () => number): StatusReport {
  const spi = project.spi ?? 1;
  const cpi = project.cpi ?? 1;
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return {
    projectId: project.id,
    period,
    spi,
    cpi,
    summary: pick(rand, summaryTemplates[project.health]),
    risks: risksTemplates[project.health],
    nextSteps: "Concluir as micro-etapas em andamento e preparar submissão para o próximo gate de decisão.",
  };
}

export function generateExecutionDetails(projects: Project[]): Map<string, ProjectExecutionDetail> {
  const now = new Date();
  const map = new Map<string, ProjectExecutionDetail>();

  const relevant = projects.filter((p) => p.funnelStage === "execucao" || p.funnelStage === "encerrado");

  relevant.forEach((project, idx) => {
    const rand = mulberry32(1_000_003 * (idx + 7));
    const { phases, microStages } = buildStructure(project, now, rand);
    const scurve = buildSCurve(project, now, rand);
    const statusReport = buildStatusReport(project, now, rand);

    map.set(project.id, { projectId: project.id, phases, microStages, scurve, statusReport });
  });

  return map;
}
