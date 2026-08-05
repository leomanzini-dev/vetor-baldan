import { useThemeStore } from "@/store/themeStore";
import { lensSlotColor } from "@/config/chartPalette";
import type { LensDef } from "@/config/lenses";

interface Props {
  weights: Record<string, number>;
  lenses: LensDef[];
}

// Mini barra empilhada — a "impressão digital" visual de um cenário de pesos.
// Usa a mesma paleta categórica (e o mesmo mapeamento lente→cor) do donut de
// Priorização, então o olho já reconhece "azul = Financeiro" de uma tela pra
// outra sem precisar reler a legenda.
export function PresetPreviewBar({ weights, lenses }: Props) {
  const mode = useThemeStore((s) => s.mode);

  const entries = lenses
    .map((lens, index) => ({ id: lens.id, name: lens.short, value: Math.max(weights[lens.id] ?? 0, 0), colorIndex: index }))
    .filter((e) => e.value > 0);
  const total = entries.reduce((sum, e) => sum + e.value, 0) || 1;

  if (entries.length === 0) {
    return <div className="h-2.5 w-full rounded-full bg-app-alt" />;
  }

  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-app-alt" role="img" aria-label="Distribuição de pesos do cenário">
      {entries.map((e) => (
        <div
          key={e.id}
          title={`${e.name} · ${e.value}%`}
          style={{ width: `${(e.value / total) * 100}%`, backgroundColor: lensSlotColor(e.colorIndex, mode) }}
          className="h-full first:rounded-l-full last:rounded-r-full"
        />
      ))}
    </div>
  );
}
