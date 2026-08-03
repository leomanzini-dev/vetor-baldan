import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ParamsState {
  pointsPerHour: number;
  workingDaysPerMonth: number;
  setPointsPerHour: (v: number) => void;
  setWorkingDaysPerMonth: (v: number) => void;
  reset: () => void;
}

const defaults = { pointsPerHour: 10, workingDaysPerMonth: 21 };

export const useParamsStore = create<ParamsState>()(
  persist(
    (set) => ({
      ...defaults,
      setPointsPerHour: (v) => set({ pointsPerHour: v }),
      setWorkingDaysPerMonth: (v) => set({ workingDaysPerMonth: v }),
      reset: () => set(defaults),
    }),
    { name: "vetor-platform-params" }
  )
);
