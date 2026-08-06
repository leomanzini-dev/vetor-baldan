import { useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { pickThemed, verticalChartColors } from "@/config/chartPalette";
import { verticalNames } from "@/config/verticals";
import { formatCurrencyK } from "@/lib/format";
import type { VerticalCapexEntry } from "@/lib/roadmap";

export function InvestmentByVerticalChart({ data }: { data: VerticalCapexEntry[] }) {
  const mode = useThemeStore((s) => s.mode);
  const [hovered, setHovered] = useState<string | null>(null);
  const total = data.reduce((sum, d) => sum + d.capexK, 0);
  const hoveredEntry = hovered ? data.find((d) => d.vertical === hovered) : null;

  if (data.length === 0 || total === 0) {
    return <div className="flex h-[170px] items-center justify-center text-[12.5px] text-text-tertiary">Sem dados de investimento.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative shrink-0">
        <ResponsiveContainer width={170} height={170}>
          <PieChart>
            <Pie
              data={data}
              dataKey="capexK"
              nameKey="vertical"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              stroke={pickThemed(mode, { light: "#FFFFFF", dark: "#1D1B15" })}
              strokeWidth={2}
              isAnimationActive
              animationDuration={420}
              onMouseEnter={(_, i) => setHovered(data[i].vertical)}
              onMouseLeave={() => setHovered(null)}
            >
              {data.map((d) => (
                <Cell
                  key={d.vertical}
                  fill={pickThemed(mode, verticalChartColors[d.vertical])}
                  fillOpacity={!hovered || hovered === d.vertical ? 1 : 0.32}
                  className="cursor-pointer transition-opacity"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
          {hoveredEntry ? (
            <>
              <span className="font-mono text-[16px] font-bold leading-none text-text">{formatCurrencyK(hoveredEntry.capexK)}</span>
              <span className="mt-1 line-clamp-1 text-[9px] font-bold uppercase tracking-wide text-text-tertiary">
                {verticalNames[hoveredEntry.vertical]}
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-[16px] font-bold leading-none text-text">{formatCurrencyK(total)}</span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-text-tertiary">CAPEX total</span>
            </>
          )}
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5">
        {data.map((d) => {
          const share = total > 0 ? Math.round((d.capexK / total) * 100) : 0;
          const isActive = hovered === d.vertical;
          return (
            <li
              key={d.vertical}
              onMouseEnter={() => setHovered(d.vertical)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-[12px] transition-colors ${isActive ? "bg-app-alt" : ""}`}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pickThemed(mode, verticalChartColors[d.vertical]) }} />
              <span className={`min-w-0 flex-1 truncate ${isActive ? "font-semibold text-text" : "text-text-secondary"}`}>
                {verticalNames[d.vertical]}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-semibold text-text">{formatCurrencyK(d.capexK)}</span>
              <span className="w-9 shrink-0 text-right text-[10px] text-text-tertiary">{share}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
