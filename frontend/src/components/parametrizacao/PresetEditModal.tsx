import { useEffect, useState } from "react";
import { X, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { LensWeightRow } from "@/components/priorizacao/LensWeightRow";
import { PresetPreviewBar } from "@/components/parametrizacao/PresetPreviewBar";
import type { LensDef, LensId } from "@/config/lenses";

export interface EditablePreset {
  id: string;
  label: string;
  description: string;
  weights: Record<LensId, number>;
  isBuiltin: boolean;
  isBaseline: boolean; // true só para "padrao" — a linha de base do sistema
}

interface Props {
  preset: EditablePreset;
  lenses: LensDef[];
  onClose: () => void;
  onSave: (weights: Record<LensId, number>, label: string, description: string) => void;
  onDelete?: () => void;
}

export function PresetEditModal({ preset, lenses, onClose, onSave, onDelete }: Props) {
  const [weights, setWeights] = useState<Record<LensId, number>>(preset.weights);
  const [label, setLabel] = useState(preset.label);
  const [description, setDescription] = useState(preset.description);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const weightSum = lenses.reduce((sum, l) => sum + (weights[l.id] ?? 0), 0) || 1;

  function setLensWeight(id: LensId, value: number) {
    setWeights((w) => ({ ...w, [id]: value }));
  }

  function resetToOriginal() {
    setWeights(preset.weights);
  }

  function handleSave() {
    onSave(weights, label.trim() || preset.label, description.trim() || preset.description);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-border bg-surface shadow-token-lg">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            {preset.isBuiltin ? (
              <h2 className="truncate text-[16px] font-semibold text-text">{preset.label}</h2>
            ) : (
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full truncate rounded-md border border-transparent bg-transparent text-[16px] font-semibold text-text outline-none transition-colors hover:border-border focus:border-primary focus:bg-app-alt"
              />
            )}
            {preset.isBaseline && (
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <ShieldCheck className="h-3 w-3" />
                Linha de base do sistema
              </span>
            )}
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
          {preset.isBaseline && (
            <div className="rounded-md border border-primary-soft bg-primary-soft/40 p-3.5 text-[12px] leading-relaxed text-text-secondary">
              Esta é a configuração usada sempre que alguém clica em <strong className="text-text">"Restaurar padrão"</strong> em
              Priorização, e o ponto de partida de todo novo cenário. Redefina aqui uma única vez — não precisa ajustar lente por
              lente toda vez que a liderança mudar de direção.
            </div>
          )}

          {preset.isBuiltin ? (
            <p className="text-[12.5px] text-text-tertiary">{preset.description}</p>
          ) : (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Quando usar este cenário
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-md border border-border bg-app-alt px-3 py-2 text-[12.5px] text-text outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
              />
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Pré-visualização</span>
              <button
                onClick={resetToOriginal}
                className="flex items-center gap-1 text-[11px] font-semibold text-text-tertiary transition-colors hover:text-primary"
              >
                <RotateCcw className="h-3 w-3" />
                Desfazer alterações
              </button>
            </div>
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

        <footer className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
          {!preset.isBuiltin && onDelete ? (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-text-tertiary transition-colors hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir cenário
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-md px-3.5 py-2 text-[13px] font-semibold text-text-tertiary hover:text-text">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
            >
              Salvar alterações
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
