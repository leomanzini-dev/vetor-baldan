import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ResourceRequestStatus = "pendente" | "atendida" | "recusada";

export interface ResourceRequest {
  id: string;
  projectId: string;
  personId: string;
  message: string;
  createdAt: string; // ISO datetime
  status: ResourceRequestStatus;
}

interface ResourceRequestsState {
  requests: ResourceRequest[];
  addRequest: (input: { projectId: string; personId: string; message: string }) => void;
  setStatus: (id: string, status: ResourceRequestStatus) => void;
  reset: () => void;
}

export const useResourceRequestsStore = create<ResourceRequestsState>()(
  persist(
    (set) => ({
      requests: [],
      addRequest: (input) =>
        set((state) => ({
          requests: [
            {
              id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              projectId: input.projectId,
              personId: input.personId,
              message: input.message,
              createdAt: new Date().toISOString(),
              status: "pendente" as const,
            },
            ...state.requests,
          ],
        })),
      setStatus: (id, status) =>
        set((state) => ({ requests: state.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
      reset: () => set({ requests: [] }),
    }),
    { name: "vetor-resource-requests" }
  )
);
