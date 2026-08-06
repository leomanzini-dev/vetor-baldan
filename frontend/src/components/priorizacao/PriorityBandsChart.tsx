import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed, priorityBandColors } from "@/config/chartPalette";
import type { PriorityBand } from "@/lib/rankingStats";

export function PriorityBandsChart({ bands }: { bands: PriorityBand[] }) {
  const mode = useThemeStore((s) => s.mode);
  const total = bands.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <ResponsiveContainer width={140} height={150}>
          <PieChart>
            <Pie
              data={bands}
              dataKey="count"
              nameKey="label"
              innerRadius={42}
              outerRadius={68}
              paddingAngle={3}
              stroke={pickThemed(mode, { light: "#FFFFFF", dark: "#1D1B15" })}
              strokeWidth={2}
              isAnimationActive
              animationDuration={420}
            >
              {bands.map((b) => (
                <Cell key={b.id} fill={pickThemed(mode, priorityBandColors[b.id])} />
              ))}
            </Pie>
            <Tooltip content={<BandTooltip mode={mode} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[18px] font-bold leading-none text-text">{total}</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-text-tertiary">projetos</span>
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-2.5">
        {bands.map((b) => (
          <li key={b.id} className="flex items-center gap-2 text-[12.5px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pickThemed(mode, priorityBandColors[b.id]) }} />
            <span className="flex-1 font-semibold text-text">{b.label}</span>
            <span className="shrink-0 font-mono text-[11px] text-text-tertiary">
              {b.count > 0 ? `${b.minScore.toFixed(0)}–${b.maxScore.toFixed(0)}` : "—"}
            </span>
            <span className="w-6 shrink-0 text-right font-mono font-bold text-text">{b.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BandTooltip({ active, payload, mode }: { active?: boolean; payload?: { payload: PriorityBand }[]; mode: "light" | "dark" }) {
  if (!active || !payload?.length) return null;
  const band = payload[0].payload;
  return (
    <div
      className="rounded-md px-3 py-2 text-[12px] shadow-token-md"
      style={{ background: pickThemed(mode, chartChrome.tooltipBg), border: `1px solid ${pickThemed(mode, chartChrome.tooltipBorder)}` }}
    >
      <p className="font-semibold text-text">{band.label}</p>
      <p className="font-mono text-text-secondary">
        {band.count} projeto{band.count === 1 ? "" : "s"} · {band.minScore.toFixed(0)}–{band.maxScore.toFixed(0)} pts
      </p>
    </div>
  );
}
