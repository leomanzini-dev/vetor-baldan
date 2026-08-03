import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultWeights, type LensId } from "@/config/lenses";

interface WeightsState {
  weights: Record<LensId, number>;
  activePresetId: string | null;
  setWeight: (lens: LensId, value: number) => void;
  applyPreset: (presetId: string, weights: Record<LensId, number>) => void;
  reset: () => void;
}

export const useWeightsStore = create<WeightsState>()(
  persist(
    (set) => ({
      weights: defaultWeights,
      activePresetId: "padrao",
      setWeight: (lens, value) =>
        set((state) => ({
          weights: { ...state.weights, [lens]: value },
          activePresetId: null,
        })),
      applyPreset: (presetId, weights) => set({ weights, activePresetId: presetId }),
      reset: () => set({ weights: defaultWeights, activePresetId: "padrao" }),
    }),
    { name: "vetor-priorizacao-pesos" }
  )
);
