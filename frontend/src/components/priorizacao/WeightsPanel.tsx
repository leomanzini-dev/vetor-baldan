import { useState } from "react";
import { RotateCcw, Plus, X, Save, Star } from "lucide-react";
import { weightPresets } from "@/config/lenses";
import { useWeightsStore } from "@/store/weightsStore";
import { useAllLenses } from "@/hooks/useLenses";
import { LensWeightRow } from "@/components/priorizacao/LensWeightRow";

export function WeightsPanel() {
  const weights = useWeightsStore((s) => s.weights);
  const activePresetId = useWeightsStore((s) => s.activePresetId);
  const presetWeights = useWeightsStore((s) => s.presetWeights);
  const setWeight = useWeightsStore((s) => s.setWeight);
  const applyPreset = useWeightsStore((s) => s.applyPreset);
  const addCustomLens = useWeightsStore((s) => s.addCustomLens);
  const removeCustomLens = useWeightsStore((s) => s.removeCustomLens);
  const customLenses = useWeightsStore((s) => s.customLenses);
  const customPresets = useWeightsStore((s) => s.customPresets);
  const saveCurrentAsPreset = useWeightsStore((s) => s.saveCurrentAsPreset);
  const removeCustomPreset = useWeightsStore((s) => s.removeCustomPreset);
  const reset = useWeightsStore((s) => s.reset);
  const allLenses = useAllLenses();

  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");

  const weightSum = allLenses.reduce((sum, l) => sum + (weights[l.id] ?? 0), 0) || 1;

  function submitNewLens() {
    const label = newLabel.trim();
    if (!label) return;
    addCustomLens(label, newDescription.trim() || "Lente personalizada, criada pela equipe.");
    setNewLabel("");
    setNewDescription("");
    setCreating(false);
  }

  function submitNewPreset() {
    const label = presetName.trim();
    if (!label) return;
    saveCurrentAsPreset(label, presetDescription.trim() || "Cenário salvo pela equipe a partir da configuração atual.");
    setPresetName("");
    setPresetDescription("");
    setSavingPreset(false);
  }

  return (
    <div className="rounded-card border border-border bg-surface shadow-token-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-text">Lentes & Pesos</h3>
          <p className="mt-0.5 text-[12px] text-text-tertiary">Totalmente parametrizável — os pesos não precisam somar 100</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-semibold text-text-tertiary transition-colors hover:border-primary/40 hover:text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar padrão
          </button>
          <button
            onClick={() => setCreating((v) => !v)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova lente
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {creating && (
          <div className="flex flex-col gap-2.5 rounded-md border border-dashed border-primary/40 bg-primary-soft/30 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Nova lente</p>
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitNewLens()}
              placeholder="Nome da lente — ex: Sinergia com Rede de Distribuidores"
              className="w-full rounded-md border border-border bg-app-alt px-3 py-2 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="O que ela avalia (opcional)"
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-app-alt px-3 py-2 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={submitNewLens}
                disabled={!newLabel.trim()}
                className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
              >
                Adicionar lente
              </button>
              <button
                onClick={() => {
                  setCreating(false);
                  setNewLabel("");
                  setNewDescription("");
                }}
                className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-text-tertiary hover:text-text"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Cenários prontos</p>
          <div className="flex flex-wrap items-center gap-2">
            {weightPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id, presetWeights[preset.id] ?? preset.weights)}
                title={preset.description}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  activePresetId === preset.id
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-app-alt text-text-secondary hover:border-primary/40"
                }`}
              >
                {preset.label}
              </button>
            ))}
            {customPresets.map((preset) => (
              <span
                key={preset.id}
                className={`group flex items-center gap-1 rounded-full border py-1.5 pl-3 pr-1.5 text-[12px] font-semibold transition-colors ${
                  activePresetId === preset.id
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-app-alt text-text-secondary hover:border-primary/40"
                }`}
              >
                <button
                  onClick={() => applyPreset(preset.id, presetWeights[preset.id] ?? {})}
                  title={preset.description}
                  className="flex items-center gap-1"
                >
                  <Star className="h-3 w-3 shrink-0" />
                  {preset.label}
                </button>
                <button
                  onClick={() => removeCustomPreset(preset.id)}
                  aria-label={`Remover cenário ${preset.label}`}
                  title="Remover cenário"
                  className="flex h-4 w-4 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setSavingPreset((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[12px] font-semibold text-text-tertiary transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Save className="h-3 w-3" />
              Salvar cenário atual
            </button>
          </div>

          {savingPreset && (
            <div className="mt-3 flex flex-col gap-2.5 rounded-md border border-dashed border-primary/40 bg-primary-soft/30 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Novo cenário</p>
              <input
                autoFocus
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitNewPreset()}
                placeholder="Nome do cenário — ex: Foco em Peças de Reposição"
                className="w-full rounded-md border border-border bg-app-alt px-3 py-2 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
              />
              <textarea
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Quando usar este cenário (opcional)"
                rows={2}
                className="w-full resize-none rounded-md border border-border bg-app-alt px-3 py-2 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={submitNewPreset}
                  disabled={!presetName.trim()}
                  className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
                >
                  Salvar os {allLenses.length} pesos atuais
                </button>
                <button
                  onClick={() => {
                    setSavingPreset(false);
                    setPresetName("");
                    setPresetDescription("");
                  }}
                  className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-text-tertiary hover:text-text"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {allLenses.map((lens) => {
            const value = weights[lens.id] ?? 0;
            const pct = Math.round((value / weightSum) * 100);
            const isCustom = customLenses.some((l) => l.id === lens.id);
            return (
              <LensWeightRow
                key={lens.id}
                lens={lens}
                value={value}
                pct={pct}
                isCustom={isCustom}
                onChange={(v) => setWeight(lens.id, v)}
                onRemove={isCustom ? () => removeCustomLens(lens.id) : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
