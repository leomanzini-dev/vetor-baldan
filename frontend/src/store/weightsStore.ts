import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultWeights, weightPresets, type LensId } from "@/config/lenses";

export interface CustomLens {
  id: string;
  label: string;
  description: string;
}

export interface CustomPreset {
  id: string;
  label: string;
  description: string;
}

const DIACRITIC_MARKS = /[̀-ͯ]/g;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(DIACRITIC_MARKS, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "") || "item"
  );
}

function uniqueId(prefix: string, label: string, existingIds: Iterable<string>): string {
  const taken = new Set(existingIds);
  const slug = slugify(label);
  let id = `${prefix}-${slug}`;
  let n = 2;
  while (taken.has(id)) {
    id = `${prefix}-${slug}-${n}`;
    n += 1;
  }
  return id;
}

const CUSTOM_LENS_DEFAULT_WEIGHT = 15;

// Ponto de partida dos pesos de cada cenário pronto do sistema — só o valor
// inicial. Depois de editado em Parametrização, o valor que manda é o que
// está em `presetWeights`, não mais este objeto.
const initialPresetWeights: Record<string, Record<LensId, number>> = Object.fromEntries(
  weightPresets.map((p) => [p.id, { ...p.weights }])
);

interface WeightsState {
  weights: Record<LensId, number>;
  customLenses: CustomLens[];
  customPresets: CustomPreset[];
  // Pesos correntes de TODO cenário — os 4 do sistema (incl. "padrao", que
  // dobra como a linha de base organizacional usada por "Restaurar padrão")
  // e os personalizados salvos pela equipe. Nome/descrição dos cenários do
  // sistema continuam fixos em config/lenses.ts; só os pesos moram aqui.
  presetWeights: Record<string, Record<LensId, number>>;
  activePresetId: string | null;
  setWeight: (lens: LensId, value: number) => void;
  applyPreset: (presetId: string, weights: Record<LensId, number>) => void;
  addCustomLens: (label: string, description: string) => void;
  removeCustomLens: (id: string) => void;
  saveCurrentAsPreset: (label: string, description: string) => void;
  createPreset: (label: string, description: string, weights: Record<LensId, number>) => void;
  removeCustomPreset: (id: string) => void;
  // Edita a "receita" de pesos de qualquer cenário (do sistema ou
  // personalizado) sem alterar a edição em andamento na Priorização.
  updatePresetWeights: (id: string, weights: Record<LensId, number>) => void;
  updateCustomPresetMeta: (id: string, label: string, description: string) => void;
  reset: () => void;
}

export const useWeightsStore = create<WeightsState>()(
  persist(
    (set) => ({
      weights: defaultWeights,
      customLenses: [],
      customPresets: [],
      presetWeights: initialPresetWeights,
      activePresetId: "padrao",
      setWeight: (lens, value) =>
        set((state) => ({
          weights: { ...state.weights, [lens]: value },
          activePresetId: null,
        })),
      // mescla em vez de substituir: um preset só conhece as lentes que existiam
      // quando foi criado, então lentes fora dele mantêm o peso já configurado
      applyPreset: (presetId, weights) =>
        set((state) => ({ weights: { ...state.weights, ...weights }, activePresetId: presetId })),
      addCustomLens: (label, description) =>
        set((state) => {
          const slug = slugify(label);
          let id = `custom-${slug}`;
          let n = 2;
          while (id in state.weights) {
            id = `custom-${slug}-${n}`;
            n += 1;
          }
          return {
            customLenses: [...state.customLenses, { id, label, description }],
            weights: { ...state.weights, [id]: CUSTOM_LENS_DEFAULT_WEIGHT },
            activePresetId: null,
          };
        }),
      removeCustomLens: (id) =>
        set((state) => {
          const nextWeights = { ...state.weights };
          delete nextWeights[id];
          return {
            customLenses: state.customLenses.filter((l) => l.id !== id),
            weights: nextWeights,
          };
        }),
      // Congela a configuração de pesos atual (inclusive lentes personalizadas
      // ativas no momento) como um novo cenário reutilizável, ao lado dos
      // cenários prontos do sistema.
      saveCurrentAsPreset: (label, description) =>
        set((state) => {
          const id = uniqueId("preset", label, Object.keys(state.presetWeights));
          const preset: CustomPreset = { id, label, description };
          return {
            customPresets: [...state.customPresets, preset],
            presetWeights: { ...state.presetWeights, [id]: { ...state.weights } },
            activePresetId: id,
          };
        }),
      // Cria um cenário do zero a partir do modal de Parametrização — não mexe
      // na edição em andamento na Priorização nem o marca como ativo; ele só
      // passa a existir na galeria até alguém clicar em "Aplicar".
      createPreset: (label, description, weights) =>
        set((state) => {
          const id = uniqueId("preset", label, Object.keys(state.presetWeights));
          const preset: CustomPreset = { id, label, description };
          return {
            customPresets: [...state.customPresets, preset],
            presetWeights: { ...state.presetWeights, [id]: weights },
          };
        }),
      removeCustomPreset: (id) =>
        set((state) => {
          const nextPresetWeights = { ...state.presetWeights };
          delete nextPresetWeights[id];
          return {
            customPresets: state.customPresets.filter((p) => p.id !== id),
            presetWeights: nextPresetWeights,
            activePresetId: state.activePresetId === id ? null : state.activePresetId,
          };
        }),
      updatePresetWeights: (id, weights) =>
        set((state) => ({ presetWeights: { ...state.presetWeights, [id]: weights } })),
      updateCustomPresetMeta: (id, label, description) =>
        set((state) => ({
          customPresets: state.customPresets.map((p) => (p.id === id ? { ...p, label, description } : p)),
        })),
      // "Restaurar padrão" volta para a linha de base do PADRÃO BALDAN vigente
      // — que pode já ter sido redefinida em Parametrização, não necessariamente
      // os valores originais de fábrica.
      reset: () =>
        set((state) => ({
          weights: { ...(state.presetWeights.padrao ?? defaultWeights) },
          customLenses: [],
          activePresetId: "padrao",
        })),
    }),
    { name: "vetor-priorizacao-pesos" }
  )
);
