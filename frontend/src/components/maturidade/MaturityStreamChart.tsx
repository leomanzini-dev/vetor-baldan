import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed, trlBandColors } from "@/config/chartPalette";
import { trlBands } from "@/config/trl";
import type { RoadmapYearEntry } from "@/lib/roadmap";

interface Props {
  data: RoadmapYearEntry[];
  currentYear: number;
}

interface TooltipEntry {
  dataKey: string;
  value: number;
  color: string;
}

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
  const total = payload.reduce((sum, e) => sum + e.value, 0);
  return (
    <div className="rounded-md px-3 py-2.5 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="mb-1.5 flex items-center justify-between gap-4 font-mono font-semibold text-text">
        <span>{label}</span>
        <span className="text-text-tertiary">{total} projetos</span>
      </p>
      {[...payload].reverse().map((entry) => {
        const band = trlBands.find((b) => b.id === entry.dataKey);
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {band?.label}
            </span>
            <span className="font-mono font-semibold text-text">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MaturityStreamChart({ data, currentYear }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);
  const gridColor = pickThemed(mode, chartChrome.gridline);
  const colors = mode === "dark" ? trlBandColors.dark : trlBandColors.light;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: -12 }}>
        <defs>
          {trlBands.map((band, i) => (
            <linearGradient key={band.id} id={`stream-${band.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[i]} stopOpacity={0.85} />
              <stop offset="100%" stopColor={colors[i]} stopOpacity={0.45} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          tick={(props) => {
            const { x, y, payload } = props;
            const isCurrent = Number(payload.value) === currentYear;
            return (
              <text
                x={x}
                y={Number(y) + 14}
                textAnchor="middle"
                fontSize={12}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={isCurrent ? 700 : 400}
                fill={isCurrent ? "var(--primary)" : axisColor}
              >
                {payload.value}
              </text>
            );
          }}
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 11 }} width={30} allowDecimals={false} />
        <Tooltip content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />} />
        <Legend
          verticalAlign="top"
          align="right"
          height={28}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: axisColor, fontSize: 12 }}>{trlBands.find((b) => b.id === value)?.label}</span>
          )}
        />
        <ReferenceLine x={currentYear} stroke="var(--primary)" strokeDasharray="3 3" strokeOpacity={0.6} />
        <Area type="monotone" dataKey="descoberta" stackId="trl" stroke={colors[0]} strokeWidth={1.5} fill="url(#stream-descoberta)" isAnimationActive animationDuration={600} />
        <Area type="monotone" dataKey="validacao" stackId="trl" stroke={colors[1]} strokeWidth={1.5} fill="url(#stream-validacao)" isAnimationActive animationDuration={600} />
        <Area type="monotone" dataKey="escala" stackId="trl" stroke={colors[2]} strokeWidth={1.5} fill="url(#stream-escala)" isAnimationActive animationDuration={600} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
