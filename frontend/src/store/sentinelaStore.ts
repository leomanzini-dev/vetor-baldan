import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildSeedEvents, type SentinelaEvent } from "@/config/sentinela";

const MAX_EVENTS = 300;

interface SentinelaState {
  events: SentinelaEvent[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addEvent: (event: SentinelaEvent) => void;
  clearEvents: () => void;
}

export const useSentinelaStore = create<SentinelaState>()(
  persist(
    (set) => ({
      events: buildSeedEvents(),
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addEvent: (event) =>
        set((state) => ({ events: [event, ...state.events].slice(0, MAX_EVENTS) })),
      clearEvents: () => set({ events: buildSeedEvents() }),
    }),
    { name: "vetor-sentinela" }
  )
);
