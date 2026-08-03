import { create } from "zustand";
import { persist } from "zustand/middleware";

// Simulação de perfil ativo — permite alternar a "lente" de navegação entre
// Diretoria, PMO, Área, Controladoria e Executor. Não há autenticação real:
// é uma troca de persona para fins de demonstração (ver Módulo 5 — Perfis).
interface PersonaState {
  activePersonId: string;
  setActivePerson: (id: string) => void;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set) => ({
      activePersonId: "p-diretoria-1",
      setActivePerson: (id) => set({ activePersonId: id }),
    }),
    { name: "vetor-persona" }
  )
);
