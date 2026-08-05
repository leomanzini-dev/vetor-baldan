import { X } from "lucide-react";
import type { LensDef } from "@/config/lenses";

interface Props {
  lens: LensDef;
  value: number;
  pct: number;
  isCustom?: boolean;
  onChange: (value: number) => void;
  onRemove?: () => void;
}

function clampPct(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

// Linha slider + input numérico + descrição de uma lente — usada tanto no
// editor ao vivo (Priorização) quanto no modal de edição de cenário
// (Parametrização), sempre controlada de fora (não lê a store diretamente).
export function LensWeightRow({ lens, value, pct, isCustom, onChange, onRemove }: Props) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <lens.icon className="h-4 w-4 shrink-0 text-text-tertiary" />
          <span className="truncate text-[13px] font-semibold text-text">{lens.label}</span>
          {isCustom && (
            <span className="shrink-0 rounded-full bg-app-alt px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-text-tertiary">
              personalizada
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden font-mono text-[11px] text-text-tertiary sm:inline">{pct}% do total</span>
          <div className="flex items-center rounded-md border border-border bg-app-alt focus-within:border-primary">
            <input
              type="number"
              min={0}
              max={100}
              value={value}
              onChange={(e) => onChange(clampPct(Number(e.target.value)))}
              className="w-12 bg-transparent px-1.5 py-1 text-right font-mono text-[12.5px] font-bold text-text outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={`Peso de ${lens.label}, em porcentagem`}
            />
            <span className="pr-1.5 font-mono text-[12.5px] font-bold text-text-tertiary">%</span>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              aria-label={`Remover lente ${lens.label}`}
              title="Remover lente"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: "var(--primary)" }}
        aria-label={`Peso de ${lens.label}`}
      />
      <p className="mt-1 text-[11px] leading-snug text-text-tertiary">{lens.description}</p>
    </div>
  );
}
