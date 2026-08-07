import { todayISO } from "@/store/microStagesStore";
import type { CapacityResponse, MicroStage, MicroStageStatus, Phase, PhaseStatus, ProjectExecutionDetail } from "@/types/domain";

export function applyStatusOverrides(microStages: MicroStage[], overrides: Record<string, MicroStageStatus>): MicroStage[] {
  return microStages.map((m) => {
    const status = overrides[m.id];
    if (!status || status === m.status) return m;
    return { ...m, status, completedDate: status === "concluida" ? (m.completedDate ?? todayISO()) : m.completedDate };
  });
}

function phaseStatusFromMicroStages(microStages: MicroStage[]): PhaseStatus {
  if (microStages.every((m) => m.status === "concluida")) return "concluida";
  if (microStages.some((m) => m.status === "concluida" || m.status === "em-andamento")) return "em-andamento";
  return "pendente";
}

// Combina os dados gerados (estáticos) com micro-etapas criadas pelo gestor
// em Parametrização e com mudanças de status feitas em Minhas Tarefas /
// Análise Execução — sempre lidas do mesmo store, para as três telas
// concordarem sobre o que já foi entregue.
export function mergeExecutionDetail(
  base: ProjectExecutionDetail,
  custom: MicroStage[],
  overrides: Record<string, MicroStageStatus>
): ProjectExecutionDetail {
  const customForProject = custom.filter((m) => m.projectId === base.projectId);
  const microStages = applyStatusOverrides([...base.microStages, ...customForProject], overrides);

  const phases: Phase[] = base.phases.map((phase) => {
    const items = microStages.filter((m) => m.phaseId === phase.id);
    if (items.length === 0) return phase; // nível futuro, ainda sem micro-etapas
    return { ...phase, status: phaseStatusFromMicroStages(items) };
  });

  return { ...base, microStages, phases };
}

export function mergeCapacitySummary(
  base: CapacityResponse,
  custom: MicroStage[],
  overrides: Record<string, MicroStageStatus>
): CapacityResponse {
  const isCurrentMonth = (iso: string) => iso.slice(0, 7) === base.currentMonth;

  const summary = base.summary.map((s) => {
    const customForPerson = custom.filter((m) => m.assigneeId === s.person.id && isCurrentMonth(m.dueDate));
    const microStages = applyStatusOverrides([...s.microStages, ...customForPerson], overrides);
    const pointsEarned = microStages.filter((m) => m.status === "concluida").reduce((sum, m) => sum + m.points, 0);
    const pointsCommitted = microStages.reduce((sum, m) => sum + m.points, 0);
    return { ...s, microStages, pointsEarned, pointsCommitted };
  });

  return { ...base, summary };
}
