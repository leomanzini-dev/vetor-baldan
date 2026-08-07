import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MicroStage, MicroStageStatus } from "@/types/domain";

export interface NewMicroStageInput {
  projectId: string;
  phaseId: string; // id da fase (nível TRL) à qual pertence
  trlLevel: number;
  name: string;
  hours: number;
  points: number;
  assigneeId: string;
  dueDate: string;
}

interface MicroStagesState {
  // Micro-etapas criadas pelo gestor em Parametrização, além das geradas pelo
  // sistema — mantidas separadas da base para nunca perder o que foi criado
  // manualmente ao trocar de dado gerado.
  custom: MicroStage[];
  // Mudança de status de QUALQUER micro-etapa (gerada ou custom), por id —
  // fonte única de verdade compartilhada entre Minhas Tarefas, Parametrização
  // e Análise Execução, para que concluir uma entrega em um lugar reflita em
  // todos os outros.
  statusOverrides: Record<string, MicroStageStatus>;
  // Impedimento relatado pelo responsável (id da micro-etapa -> motivo) —
  // não muda o status da entrega, só sinaliza um bloqueio externo que
  // Análise Execução usa para priorizar "Projetos em Defasagem".
  impediments: Record<string, string>;
  addMicroStage: (input: NewMicroStageInput) => void;
  removeMicroStage: (id: string) => void;
  setStatus: (id: string, status: MicroStageStatus) => void;
  setImpediment: (id: string, reason: string) => void;
  clearImpediment: (id: string) => void;
  // Transfere uma micro-etapa já vinculada de um responsável para outro —
  // mantém id/status/histórico, só troca quem executa.
  reassignMicroStage: (id: string, newAssigneeId: string) => void;
  reset: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useMicroStagesStore = create<MicroStagesState>()(
  persist(
    (set) => ({
      custom: [],
      statusOverrides: {},
      impediments: {},
      addMicroStage: (input) =>
        set((state) => {
          const id = `custom-ms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const microStage: MicroStage = {
            id,
            phaseId: input.phaseId,
            projectId: input.projectId,
            name: input.name,
            hours: input.hours,
            points: input.points,
            status: "pendente",
            assigneeId: input.assigneeId,
            dueDate: input.dueDate,
            completedDate: null,
          };
          return { custom: [...state.custom, microStage] };
        }),
      removeMicroStage: (id) =>
        set((state) => {
          const nextOverrides = { ...state.statusOverrides };
          delete nextOverrides[id];
          const nextImpediments = { ...state.impediments };
          delete nextImpediments[id];
          return { custom: state.custom.filter((m) => m.id !== id), statusOverrides: nextOverrides, impediments: nextImpediments };
        }),
      setStatus: (id, status) =>
        set((state) => {
          const nextImpediments = { ...state.impediments };
          if (status === "concluida") delete nextImpediments[id]; // entregue = impedimento resolvido
          return { statusOverrides: { ...state.statusOverrides, [id]: status }, impediments: nextImpediments };
        }),
      setImpediment: (id, reason) => set((state) => ({ impediments: { ...state.impediments, [id]: reason } })),
      reassignMicroStage: (id, newAssigneeId) =>
        set((state) => ({ custom: state.custom.map((m) => (m.id === id ? { ...m, assigneeId: newAssigneeId } : m)) })),
      clearImpediment: (id) =>
        set((state) => {
          const next = { ...state.impediments };
          delete next[id];
          return { impediments: next };
        }),
      reset: () => set({ custom: [], statusOverrides: {}, impediments: {} }),
    }),
    { name: "vetor-micro-etapas" }
  )
);

export { todayISO };
