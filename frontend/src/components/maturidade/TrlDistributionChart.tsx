import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed, trlColor } from "@/config/chartPalette";

interface Props {
  data: { level: number; count: number }[];
}

interface TooltipPayloadEntry {
  payload: { name: string; count: number };
}

function ChartTooltip({
  active,
  payload,
  bg,
  border,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  bg: string;
  border: string;
}) {
  if (!active || !payload?.length) return null;
  const { name, count } = payload[0].payload;
  return (
    <div className="rounded-md px-3 py-2 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="font-semibold text-text">{name}</p>
      <p className="text-text-secondary">{count} projetos</p>
    </div>
  );
}

export function TrlDistributionChart({ data }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);

  const chartData = data.map((d) => ({
    name: `TRL ${d.level}`,
    count: d.count,
    color: trlColor(d.level, mode),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 28, bottom: 0, left: 0 }} barSize={16}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={54}
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 12, fontFamily: "Inter, sans-serif" }}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} label={{ position: "right", fill: axisColor, fontSize: 11.5, fontWeight: 600 }}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
