import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildDefaultTemplate, templateKey, type PeriodUnit, type TrlProcessStep } from "@/config/trlProcessTemplate";
import type { VerticalId } from "@/types/domain";

interface TrlProcessTemplateState {
  steps: Record<string, TrlProcessStep[]>;
  addStep: (vertical: VerticalId, level: number, name: string, hours: number, periodValue: number, periodUnit: PeriodUnit) => void;
  removeStep: (vertical: VerticalId, level: number, stepId: string) => void;
  reset: () => void;
}

export const useTrlProcessTemplateStore = create<TrlProcessTemplateState>()(
  persist(
    (set) => ({
      steps: buildDefaultTemplate(),
      addStep: (vertical, level, name, hours, periodValue, periodUnit) =>
        set((state) => {
          const key = templateKey(vertical, level);
          const list = state.steps[key] ?? [];
          const id = `${key}-custom-${Date.now()}`;
          return { steps: { ...state.steps, [key]: [...list, { id, name, hours, periodValue, periodUnit }] } };
        }),
      removeStep: (vertical, level, stepId) =>
        set((state) => {
          const key = templateKey(vertical, level);
          return { steps: { ...state.steps, [key]: (state.steps[key] ?? []).filter((s) => s.id !== stepId) } };
        }),
      reset: () => set({ steps: buildDefaultTemplate() }),
    }),
    { name: "vetor-trl-process-template" }
  )
);
