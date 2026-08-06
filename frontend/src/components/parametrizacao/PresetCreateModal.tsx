import { useState } from "react";
import { X, Wand2, Sparkles } from "lucide-react";
import { LensWeightRow } from "@/components/priorizacao/LensWeightRow";
import { PresetPreviewBar } from "@/components/parametrizacao/PresetPreviewBar";
import type { LensDef, LensId } from "@/config/lenses";

export interface SeedOption {
  id: string;
  label: string;
  weights: Record<LensId, number>;
}

interface Props {
  lenses: LensDef[];
  seedOptions: SeedOption[];
  onClose: () => void;
  onCreate: (label: string, description: string, weights: Record<LensId, number>) => void;
}

export function PresetCreateModal({ lenses, seedOptions, onClose, onCreate }: Props) {
  const zeroWeights = Object.fromEntries(lenses.map((l) => [l.id, 0])) as Record<LensId, number>;
  const firstSeed = seedOptions[0];

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [weights, setWeights] = useState<Record<LensId, number>>(firstSeed ? { ...firstSeed.weights } : zeroWeights);
  const [seedId, setSeedId] = useState<string | null>(firstSeed?.id ?? null);

  const weightSum = lenses.reduce((sum, l) => sum + (weights[l.id] ?? 0), 0) || 1;

  function applySeed(seed: SeedOption | null) {
    setSeedId(seed?.id ?? "zero");
    setWeights(seed ? { ...seed.weights } : { ...zeroWeights });
  }

  function setLensWeight(id: LensId, value: number) {
    setWeights((w) => ({ ...w, [id]: value }));
    setSeedId(null); // deixou de bater exatamente com nenhum ponto de partida
  }

  function handleCreate() {
    const trimmed = label.trim();
    if (!trimmed) return;
    onCreate(trimmed, description.trim() || "Cenário criado em Parametrização.", weights);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-border bg-surface shadow-token-lg">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Wand2 className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="text-[16px] font-semibold text-text">Novo cenário</h2>
              <p className="text-[11.5px] text-text-tertiary">Nasce aqui, some na galeria — só entra em uso quando você aplicar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-tertiary transition-colors hover:border-primary/40 hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Nome do cenário</label>
              <input
                autoFocus
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ex: Foco em Peças de Reposição"
                className="w-full rounded-md border border-border bg-app-alt px-3 py-2 text-[13px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Quando usar (opcional)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: Ciclos com pressão de estoque de reposição"
                className="w-full rounded-md border border-border bg-app-alt px-3 py-2 text-[13px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Começar a partir de</p>
            <div className="flex flex-wrap gap-2">
              {seedOptions.map((seed) => (
                <button
                  key={seed.id}
                  onClick={() => applySeed(seed)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    seedId === seed.id
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-app-alt text-text-secondary hover:border-primary/40"
                  }`}
                >
                  {seed.label}
                </button>
              ))}
              <button
                onClick={() => applySeed(null)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  seedId === "zero"
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-app-alt text-text-secondary hover:border-primary/40"
                }`}
              >
                Do zero
              </button>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Pré-visualização</p>
            <PresetPreviewBar weights={weights} lenses={lenses} />
          </div>

          <div className="flex flex-col gap-4 border-t border-dashed border-border pt-4">
            {lenses.map((lens) => {
              const value = weights[lens.id] ?? 0;
              const pct = Math.round((value / weightSum) * 100);
              return <LensWeightRow key={lens.id} lens={lens} value={value} pct={pct} onChange={(v) => setLensWeight(lens.id, v)} />;
            })}
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose} className="rounded-md px-3.5 py-2 text-[13px] font-semibold text-text-tertiary hover:text-text">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!label.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Criar cenário
          </button>
        </footer>
      </div>
    </div>
  );
}
