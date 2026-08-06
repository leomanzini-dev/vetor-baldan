import { motion } from "framer-motion";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Gauge, Layers } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed } from "@/config/chartPalette";
import { formatIndex } from "@/lib/format";
import type { PortfolioScurve } from "@/types/domain";

interface TooltipEntry {
  dataKey: string;
  value: number | null;
  color: string;
}

const seriesLabels: Record<string, string> = {
  plannedPct: "Baseline planejado",
  actualPct: "Execução real",
  projectedPct: "Projeção IA",
};

function ChartTooltip({
  active,
  payload,
  label,
  bg,
  border,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
  bg: string;
  border: string;
}) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((e) => e.dataKey !== "actualAreaPct" && e.value !== null && e.value !== undefined);
  return (
    <div className="rounded-md px-3 py-2.5 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="mb-1.5 font-mono font-semibold text-text">{label}% do prazo</p>
      {rows.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {seriesLabels[entry.dataKey]}
          </span>
          <span className="font-mono font-semibold text-text">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function PortfolioSCurveChart({ data }: { data: PortfolioScurve }) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);
  const gridColor = pickThemed(mode, chartChrome.gridline);
  const plannedColor = pickThemed(mode, { light: "#AEAEAE", dark: "#5C584F" });
  const primary = pickThemed(mode, { light: "#CB0A26", dark: "#E23A52" });

  if (data.points.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center text-[13px] text-text-tertiary shadow-token-sm">
        Nenhum projeto em execução no momento para compor a curva-S do portfólio.
      </div>
    );
  }

  const finalPlanned = data.points[data.points.length - 1].plannedPct;
  const finalProjected = data.points[data.points.length - 1].projectedPct ?? finalPlanned;
  const gap = Math.round((finalPlanned - finalProjected) * 10) / 10;
  const paceLabel = gap > 1 ? "abaixo" : gap < -1 ? "acima" : "alinhado com";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-card border border-border bg-surface shadow-token-sm"
    >
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-text">Curva-S do Portfólio</h3>
          <p className="mt-0.5 text-[12px] text-text-tertiary">Baseline planejado × execução real × projeção IA — todos os projetos em execução ou encerrados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
            <Gauge className="h-3 w-3" /> Hoje: {formatIndex(data.progressPct)}% do prazo
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-app-alt px-2.5 py-1 text-[11px] font-bold text-text-secondary">
            <Activity className="h-3 w-3" /> SPI médio {formatIndex(data.avgSpi)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-app-alt px-2.5 py-1 text-[11px] font-bold text-text-secondary">
            <Layers className="h-3 w-3" /> {data.projectCount} projetos
          </span>
        </div>
      </div>

      <div className="px-5 pb-2 pt-4">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={data.points.map((p) => ({ ...p, actualAreaPct: p.actualPct }))}
            margin={{ top: 8, right: 16, bottom: 0, left: -18 }}
          >
            <defs>
              <linearGradient id="scurve-real-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primary} stopOpacity={0.22} />
                <stop offset="100%" stopColor={primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="tPct"
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              tick={{ fill: axisColor, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: axisColor, fontSize: 11 }}
              width={36}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />} />
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="plainline"
              formatter={(value) => (seriesLabels[value] ? <span style={{ color: axisColor, fontSize: 12 }}>{seriesLabels[value]}</span> : null)}
            />
            <ReferenceLine
              x={data.progressPct}
              stroke={primary}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{ value: "Hoje", position: "insideTopLeft", fill: primary, fontSize: 11, fontWeight: 700 }}
            />
            <Area key="area-actual" dataKey="actualAreaPct" name="actualArea" stroke="none" fill="url(#scurve-real-fill)" isAnimationActive fillOpacity={1} connectNulls={false} legendType="none" />
            <Line key="line-planned" dataKey="plannedPct" stroke={plannedColor} strokeWidth={2} dot={false} name="plannedPct" isAnimationActive />
            <Line key="line-actual" dataKey="actualPct" stroke={primary} strokeWidth={2.75} dot={false} name="actualPct" connectNulls={false} isAnimationActive />
            <Line key="line-projected" dataKey="projectedPct" stroke={primary} strokeWidth={2} strokeDasharray="6 4" dot={false} name="projectedPct" connectNulls isAnimationActive />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="border-t border-dashed border-border px-5 py-3.5 text-[12.5px] leading-relaxed text-text-secondary">
        No ritmo atual (SPI médio {formatIndex(data.avgSpi)}), a IA projeta que o portfólio conclua sua trajetória{" "}
        <span className="font-semibold text-text">
          {Math.abs(gap) <= 1 ? "praticamente alinhado ao" : `${Math.abs(gap).toFixed(1)} pontos ${paceLabel} do`}
        </span>{" "}
        baseline planejado, caso a velocidade de execução observada hoje se mantenha até o fim.
      </p>
    </motion.div>
  );
}
