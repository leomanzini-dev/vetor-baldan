import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  return (
    <div className="rounded-md px-3 py-2.5 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="mb-1.5 font-mono font-semibold text-text">{label}</p>
      {payload.map((entry) => {
        const band = trlBands.find((b) => b.id === entry.dataKey);
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 text-text-secondary">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {band?.label}: <span className="font-semibold text-text">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

export function RoadmapChart({ data, currentYear }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);
  const gridColor = pickThemed(mode, chartChrome.gridline);
  const colors = mode === "dark" ? trlBandColors.dark : trlBandColors.light;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barSize={28}>
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
        <YAxis tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 11 }} width={34} />
        <Tooltip
          cursor={{ fill: pickThemed(mode, chartChrome.gridline), opacity: 0.4 }}
          content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />}
        />
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
        <Bar dataKey="descoberta" stackId="trl" fill={colors[0]} radius={[0, 0, 0, 0]} />
        <Bar dataKey="validacao" stackId="trl" fill={colors[1]} radius={[0, 0, 0, 0]} />
        <Bar dataKey="escala" stackId="trl" fill={colors[2]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
