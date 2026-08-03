import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultTrlLevels, type TrlLevelDef } from "@/config/trl";

interface TrlState {
  levels: TrlLevelDef[];
  updateLevel: (level: number, patch: Partial<Omit<TrlLevelDef, "level">>) => void;
  reset: () => void;
}

export const useTrlStore = create<TrlState>()(
  persist(
    (set) => ({
      levels: defaultTrlLevels,
      updateLevel: (level, patch) =>
        set((state) => ({
          levels: state.levels.map((l) => (l.level === level ? { ...l, ...patch } : l)),
        })),
      reset: () => set({ levels: defaultTrlLevels }),
    }),
    { name: "vetor-trl-scale" }
  )
);
