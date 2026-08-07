import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed } from "@/config/chartPalette";
import type { MonthlyExecutionTrendPoint } from "@/types/domain";

interface TooltipEntry {
  dataKey: string;
  value: number;
  color: string;
}

const seriesLabels: Record<string, string> = {
  pointsPlanned: "Pontos previstos",
  pointsCompleted: "Pontos entregues",
  completionRatePct: "Taxa de conclusão",
};

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
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
  label?: string;
  bg: string;
  border: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md px-3 py-2.5 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="mb-1.5 font-mono font-semibold capitalize text-text">{label ? formatMonthLabel(label) : ""}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {seriesLabels[entry.dataKey]}
          </span>
          <span className="font-mono font-semibold text-text">
            {entry.dataKey === "completionRatePct" ? `${entry.value}%` : entry.value.toLocaleString("pt-BR")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ExecutionTrendChart({ data }: { data: MonthlyExecutionTrendPoint[] }) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);
  const gridColor = pickThemed(mode, chartChrome.gridline);
  const plannedColor = pickThemed(mode, { light: "#D8CFBE", dark: "#3A372F" });
  const completedColor = pickThemed(mode, { light: "#CB0A26", dark: "#E23A52" });
  const rateColor = pickThemed(mode, { light: "#2E6FBA", dark: "#4A8DD6" });

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-[13px] text-text-tertiary">
        Sem histórico de execução suficiente para compor a tendência.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          tick={{ fill: axisColor, fontSize: 11 }}
        />
        <YAxis
          yAxisId="points"
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 11 }}
          width={44}
        />
        <YAxis
          yAxisId="rate"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 11 }}
          width={38}
        />
        <Tooltip content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />} />
        <Legend
          verticalAlign="top"
          align="right"
          height={28}
          iconType="circle"
          formatter={(value) => <span style={{ color: axisColor, fontSize: 12 }}>{seriesLabels[value]}</span>}
        />
        <Bar yAxisId="points" dataKey="pointsPlanned" name="pointsPlanned" fill={plannedColor} radius={[3, 3, 0, 0]} barSize={22} />
        <Bar yAxisId="points" dataKey="pointsCompleted" name="pointsCompleted" fill={completedColor} radius={[3, 3, 0, 0]} barSize={22} />
        <Line
          yAxisId="rate"
          dataKey="completionRatePct"
          name="completionRatePct"
          stroke={rateColor}
          strokeWidth={2.5}
          dot={{ r: 3, fill: rateColor, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
