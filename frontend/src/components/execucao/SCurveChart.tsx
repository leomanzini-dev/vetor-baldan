import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed } from "@/config/chartPalette";
import type { SCurvePoint } from "@/types/domain";

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const names = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${names[Number(m) - 1]}/${year.slice(2)}`;
}

interface TooltipEntry {
  dataKey: string;
  value: number | null;
  color: string;
}

const seriesLabels: Record<string, string> = {
  plannedPct: "Planejado",
  actualPct: "Real",
  projectedPct: "Projeção",
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
  label?: string;
  bg: string;
  border: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md px-3 py-2.5 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="mb-1.5 font-mono font-semibold text-text">{label ? formatMonth(label) : ""}</p>
      {payload
        .filter((e) => e.value !== null && e.value !== undefined)
        .map((entry) => (
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

export function SCurveChart({ data }: { data: SCurvePoint[] }) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);
  const gridColor = pickThemed(mode, chartChrome.gridline);
  const plannedColor = pickThemed(mode, { light: "#AEAEAE", dark: "#5C584F" });
  const primary = pickThemed(mode, { light: "#CB0A26", dark: "#E23A52" });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 40, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          tick={{ fill: axisColor, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 11 }}
          width={38}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />} />
        <Legend
          verticalAlign="top"
          align="right"
          height={28}
          iconType="plainline"
          formatter={(value) => <span style={{ color: axisColor, fontSize: 12 }}>{seriesLabels[value]}</span>}
        />
        <Line dataKey="plannedPct" stroke={plannedColor} strokeWidth={2} dot={false} name="plannedPct" />
        <Line dataKey="actualPct" stroke={primary} strokeWidth={2.5} dot={false} name="actualPct" connectNulls={false} />
        <Line
          dataKey="projectedPct"
          stroke={primary}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          name="projectedPct"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
