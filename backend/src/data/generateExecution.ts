import type {
  MicroStage,
  MicroStageStatus,
  Phase,
  PhaseStatus,
  Project,
  ProjectExecutionDetail,
  SCurvePoint,
  StatusReport,
  Stage,
  StageStatus,
} from "../types/domain.js";
import { phaseNamesByType, stageNamePool, microStageNamePool } from "./flowTemplates.js";
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

function timeProgressFraction(project: Project, now: Date): number {
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.targetDate).getTime();
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (now.getTime() - start) / (end - start)));
}

const executors = people.filter((p) => p.profile === "executor");

function buildStructure(project: Project, now: Date, rand: () => number): { phases: Phase[]; stages: Stage[]; microStages: MicroStage[] } {
  const phaseNames = phaseNamesByType[project.type];
  const timeProgress = project.funnelStage === "encerrado" ? 1 : timeProgressFraction(project, now);

  const phases: Phase[] = [];
  const stages: Stage[] = [];
  const microStages: MicroStage[] = [];

  let stagePoolIdx = randInt(rand, 0, stageNamePool.length - 1);
  let microPoolIdx = randInt(rand, 0, microStageNamePool.length - 1);
  const vertical = executors.filter((p) => p.vertical === project.vertical || p.vertical === null);

  phaseNames.forEach((phaseName, phaseIdx) => {
    const phaseId = `${project.id}-ph${phaseIdx + 1}`;
    const phaseFractionStart = phaseIdx / phaseNames.length;
    const phaseFractionEnd = (phaseIdx + 1) / phaseNames.length;

    let phaseStatus: PhaseStatus;
    if (timeProgress >= phaseFractionEnd) phaseStatus = "concluida";
    else if (timeProgress > phaseFractionStart) phaseStatus = "em-andamento";
    else phaseStatus = "pendente";

    phases.push({ id: phaseId, projectId: project.id, name: phaseName, order: phaseIdx + 1, status: phaseStatus });

    const stageCount = randInt(rand, 2, 3);
    for (let s = 0; s < stageCount; s++) {
      const stageId = `${phaseId}-st${s + 1}`;
      const stageName = stageNamePool[stagePoolIdx % stageNamePool.length];
      stagePoolIdx++;

      const stageFractionStart = phaseFractionStart + (s / stageCount) * (phaseFractionEnd - phaseFractionStart);
      const stageFractionEnd = phaseFractionStart + ((s + 1) / stageCount) * (phaseFractionEnd - phaseFractionStart);

      let stageStatus: StageStatus;
      if (timeProgress >= stageFractionEnd) stageStatus = "concluida";
      else if (timeProgress > stageFractionStart) stageStatus = "em-andamento";
      else stageStatus = "pendente";

      stages.push({ id: stageId, phaseId, projectId: project.id, name: stageName, order: s + 1, status: stageStatus });

      const microCount = randInt(rand, 3, 5);
      for (let m = 0; m < microCount; m++) {
        const microId = `${stageId}-mc${m + 1}`;
        const microName = microStageNamePool[microPoolIdx % microStageNamePool.length];
        microPoolIdx++;

        const microFraction = stageFractionStart + ((m + 0.5) / microCount) * (stageFractionEnd - stageFractionStart);
        let status: MicroStageStatus;
        if (timeProgress >= microFraction) status = "concluida";
        else if (stageStatus === "em-andamento" && rand() < 0.3) status = "em-andamento";
        else status = "pendente";

        const hours = randInt(rand, 2, 16);
        const startMs = new Date(project.startDate).getTime();
        const endMs = new Date(project.targetDate).getTime();
        const dueDate = new Date(startMs + microFraction * (endMs - startMs));
        const completedDate = status === "concluida" ? dueDate : null;

        microStages.push({
          id: microId,
          stageId,
          projectId: project.id,
          name: microName,
          hours,
          points: hours * platformParameters.pointsPerHour,
          status,
          assigneeId: vertical.length > 0 ? pick(rand, vertical).id : pick(rand, executors).id,
          dueDate: toISODate(dueDate),
          completedDate: completedDate ? toISODate(completedDate) : null,
        });
      }
    }
  });

  return { phases, stages, microStages };
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

function sCurve(t: number): number {
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
    const { phases, stages, microStages } = buildStructure(project, now, rand);
    const scurve = buildSCurve(project, now, rand);
    const statusReport = buildStatusReport(project, now, rand);

    map.set(project.id, { projectId: project.id, phases, stages, microStages, scurve, statusReport });
  });

  return map;
}
