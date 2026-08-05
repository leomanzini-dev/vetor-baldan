import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, lensSlotColor, pickThemed } from "@/config/chartPalette";
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
      <div className="flex h-[190px] items-center justify-center text-center text-[12.5px] text-text-tertiary">
        Nenhum peso configurado ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke={pickThemed(mode, { light: "#FFFFFF", dark: "#1D1B15" })}
              strokeWidth={2}
              isAnimationActive
              animationDuration={420}
            >
              {slices.map((s) => (
                <Cell key={s.id} fill={lensSlotColor(s.colorIndex, mode)} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip mode={mode} total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[22px] font-bold leading-none text-text">{total}%</span>
          <span className="mt-1 text-center text-[9.5px] font-bold uppercase leading-tight tracking-wide text-text-tertiary">
            peso
            <br />
            configurado
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {slices.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-[12px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: lensSlotColor(s.colorIndex, mode) }} />
            <span className="min-w-0 flex-1 truncate text-text-secondary">{s.short}</span>
            <span className="shrink-0 font-mono font-semibold text-text">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TooltipPayload {
  name: string;
  value: number;
}

function DonutTooltip({ active, payload, mode, total }: { active?: boolean; payload?: { payload: TooltipPayload }[]; mode: "light" | "dark"; total: number }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
  return (
    <div
      className="rounded-md px-3 py-2 text-[12px] shadow-token-md"
      style={{ background: pickThemed(mode, chartChrome.tooltipBg), border: `1px solid ${pickThemed(mode, chartChrome.tooltipBorder)}` }}
    >
      <p className="font-semibold text-text">{item.name}</p>
      <p className="font-mono text-text-secondary">
        {item.value}% de peso · {share}% da soma total
      </p>
    </div>
  );
}
