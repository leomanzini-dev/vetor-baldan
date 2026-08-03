import { RotateCcw } from "lucide-react";
import { lensDefs, weightPresets } from "@/config/lenses";
import { useWeightsStore } from "@/store/weightsStore";

export function WeightsPanel() {
  const weights = useWeightsStore((s) => s.weights);
  const activePresetId = useWeightsStore((s) => s.activePresetId);
  const setWeight = useWeightsStore((s) => s.setWeight);
  const applyPreset = useWeightsStore((s) => s.applyPreset);
  const reset = useWeightsStore((s) => s.reset);

  const weightSum = lensDefs.reduce((sum, l) => sum + weights[l.id], 0) || 1;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Cenários prontos</p>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[11.5px] font-semibold text-text-tertiary transition-colors hover:text-primary"
          >
            <RotateCcw className="h-3 w-3" />
            Restaurar padrão
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {weightPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id, preset.weights)}
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
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {lensDefs.map((lens) => {
          const pct = Math.round((weights[lens.id] / weightSum) * 100);
          return (
            <div key={lens.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <lens.icon className="h-4 w-4 text-text-tertiary" />
                  <span className="text-[13px] font-semibold text-text">{lens.label}</span>
                </div>
                <span className="font-mono text-[12.5px] font-bold text-primary">{pct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={weights[lens.id]}
                onChange={(e) => setWeight(lens.id, Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: "var(--primary)" }}
                aria-label={`Peso de ${lens.label}`}
              />
              <p className="mt-1 text-[11px] leading-snug text-text-tertiary">{lens.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
