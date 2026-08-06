import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { pickThemed, priorityBandColors } from "@/config/chartPalette";
import type { PriorityBand } from "@/lib/rankingStats";

interface Props {
  bands: PriorityBand[];
  activeBandId?: string | null;
  onSelectBand?: (band: PriorityBand) => void;
}

export function PriorityBandsChart({ bands, activeBandId, onSelectBand }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const total = bands.reduce((sum, b) => sum + b.count, 0);

  const highlighted = hoveredId ?? activeBandId ?? null;
  const highlightedBand = highlighted ? bands.find((b) => b.id === highlighted) : null;
  const surfaceStroke = pickThemed(mode, { light: "#FFFFFF", dark: "#1D1B15" });
  const activeStroke = pickThemed(mode, { light: "#141413", dark: "#F5EDE3" });

  function toggle(band: PriorityBand) {
    onSelectBand?.(band);
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
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
              isAnimationActive
              animationDuration={420}
              onMouseEnter={(_, index) => setHoveredId(bands[index].id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={(_, index) => toggle(bands[index])}
            >
              {bands.map((b) => {
                const isActive = activeBandId === b.id;
                return (
                  <Cell
                    key={b.id}
                    fill={pickThemed(mode, priorityBandColors[b.id])}
                    fillOpacity={!highlighted || highlighted === b.id ? 1 : 0.32}
                    stroke={isActive ? activeStroke : surfaceStroke}
                    strokeWidth={isActive ? 3 : 2}
                    className="cursor-pointer transition-opacity"
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Rótulo central estático (nunca tooltip flutuante — numa rosca deste
            tamanho ele sempre cairia por cima deste mesmo texto). O hover troca
            o próprio conteúdo do rótulo em vez de abrir algo novo por cima. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          {highlightedBand ? (
            <>
              <span className="font-mono text-[16px] font-bold leading-none text-text">{highlightedBand.count}</span>
              <span className="mt-1 line-clamp-1 text-[8.5px] font-bold uppercase tracking-wide text-text-tertiary">
                {highlightedBand.label}
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-[18px] font-bold leading-none text-text">{total}</span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-text-tertiary">projetos</span>
            </>
          )}
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-1">
        {bands.map((b) => {
          const isActive = activeBandId === b.id;
          return (
            <li key={b.id}>
              <button
                onClick={() => toggle(b)}
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
                disabled={b.count === 0}
                className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-[12.5px] transition-colors disabled:cursor-default ${
                  isActive ? "bg-primary-soft" : hoveredId === b.id ? "bg-app-alt" : ""
                }`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pickThemed(mode, priorityBandColors[b.id]) }} />
                <span className={`flex-1 font-semibold ${isActive ? "text-primary" : "text-text"}`}>{b.label}</span>
                <span className="shrink-0 font-mono text-[11px] text-text-tertiary">
                  {b.count > 0 ? `${b.minScore.toFixed(0)}–${b.maxScore.toFixed(0)}` : "—"}
                </span>
                <span className={`w-6 shrink-0 text-right font-mono font-bold ${isActive ? "text-primary" : "text-text"}`}>{b.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
