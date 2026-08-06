import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { lensSlotColor, pickThemed } from "@/config/chartPalette";
import type { LensDef } from "@/config/lenses";

interface Slice {
  id: string;
  name: string;
  short: string;
  value: number;
  colorIndex: number;
}

interface Props {
  lenses: LensDef[];
  weights: Record<string, number>;
}

const MAX_SLICES = 8;

export function LensWeightDonut({ lenses, weights }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { slices, total } = useMemo(() => {
    const withValues: Slice[] = lenses
      .map((lens, index) => ({
        id: lens.id,
        name: lens.label,
        short: lens.short,
        value: Math.max(weights[lens.id] ?? 0, 0),
        colorIndex: index,
      }))
      .filter((d) => d.value > 0);

    if (withValues.length <= MAX_SLICES) {
      return { slices: withValues, total: withValues.reduce((s, d) => s + d.value, 0) };
    }

    const head = withValues.slice(0, MAX_SLICES - 1);
    const restValue = withValues.slice(MAX_SLICES - 1).reduce((s, d) => s + d.value, 0);
    const combined: Slice[] = [
      ...head,
      { id: "outras", name: "Outras lentes", short: "Outras", value: restValue, colorIndex: MAX_SLICES },
    ];
    return { slices: combined, total: combined.reduce((s, d) => s + d.value, 0) };
  }, [lenses, weights]);

  if (slices.length === 0) {
    return (
      <div className="flex h-[170px] items-center justify-center text-center text-[12.5px] text-text-tertiary">
        Nenhum peso configurado ainda.
      </div>
    );
  }

  const hovered = hoveredId ? slices.find((s) => s.id === hoveredId) : null;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative shrink-0">
        <ResponsiveContainer width={170} height={170}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              stroke={pickThemed(mode, { light: "#FFFFFF", dark: "#1D1B15" })}
              strokeWidth={2}
              isAnimationActive
              animationDuration={420}
              onMouseEnter={(_, index) => setHoveredId(slices[index].id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {slices.map((s) => (
                <Cell
                  key={s.id}
                  fill={lensSlotColor(s.colorIndex, mode)}
                  fillOpacity={!hoveredId || hoveredId === s.id ? 1 : 0.35}
                  className="cursor-pointer transition-opacity"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Rótulo central estático — nunca um tooltip flutuante, que numa rosca
            pequena sempre acaba caindo em cima desse mesmo rótulo. O hover
            troca o conteúdo do próprio rótulo em vez de abrir algo novo. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
          {hovered ? (
            <>
              <span className="font-mono text-[20px] font-bold leading-none text-text">{hovered.value}%</span>
              <span className="mt-1 line-clamp-2 text-[9.5px] font-bold uppercase leading-tight tracking-wide text-text-tertiary">
                {hovered.short}
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-[22px] font-bold leading-none text-text">{total}%</span>
              <span className="mt-1 text-[9.5px] font-bold uppercase leading-tight tracking-wide text-text-tertiary">
                peso
                <br />
                configurado
              </span>
            </>
          )}
        </div>
      </div>

      <ul className="grid flex-1 grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {slices.map((s) => (
          <li
            key={s.id}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`flex cursor-default items-center gap-2 rounded-md px-1 py-0.5 text-[12px] transition-colors ${
              hoveredId === s.id ? "bg-app-alt" : ""
            }`}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: lensSlotColor(s.colorIndex, mode) }} />
            <span className={`min-w-0 flex-1 truncate ${hoveredId === s.id ? "font-semibold text-text" : "text-text-secondary"}`}>
              {s.short}
            </span>
            <span className="shrink-0 font-mono font-semibold text-text">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
