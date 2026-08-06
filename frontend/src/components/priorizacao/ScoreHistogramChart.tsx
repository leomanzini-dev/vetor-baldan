import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed } from "@/config/chartPalette";
import type { HistogramBucket } from "@/lib/rankingStats";

interface Props {
  buckets: HistogramBucket[];
  activeRangeLabel?: string | null;
  onSelectBucket?: (bucket: HistogramBucket) => void;
}

export function ScoreHistogramChart({ buckets, activeRangeLabel, onSelectBucket }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);
  const gridColor = pickThemed(mode, chartChrome.gridline);
  const barColor = pickThemed(mode, { light: "#cb0a26", dark: "#e23a52" });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={buckets} margin={{ top: 8, right: 8, bottom: 4, left: -22 }}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis
          dataKey="rangeLabel"
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          tick={{ fill: axisColor, fontSize: 10 }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={40}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 11 }} width={34} />
        <Tooltip
          content={<HistTooltip mode={mode} />}
          cursor={{ fill: pickThemed(mode, { light: "rgba(11,11,11,0.04)", dark: "rgba(255,255,255,0.05)" }) }}
        />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          maxBarSize={38}
          isAnimationActive
          animationDuration={420}
          className="cursor-pointer"
          onClick={(data) => onSelectBucket?.(data as unknown as HistogramBucket)}
        >
          {buckets.map((b, i) => {
            const isActive = activeRangeLabel === b.rangeLabel;
            const baseOpacity = 0.4 + (i / Math.max(buckets.length - 1, 1)) * 0.6;
            const opacity = activeRangeLabel ? (isActive ? 1 : 0.25) : baseOpacity;
            return <Cell key={b.rangeLabel} fill={barColor} fillOpacity={opacity} stroke={isActive ? barColor : "none"} strokeWidth={isActive ? 2 : 0} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function HistTooltip({
  active,
  payload,
  mode,
}: {
  active?: boolean;
  payload?: { payload: HistogramBucket }[];
  mode: "light" | "dark";
}) {
  if (!active || !payload?.length) return null;
  const bucket = payload[0].payload;
  return (
    <div
      className="rounded-md px-3 py-2 text-[12px] shadow-token-md"
      style={{ background: pickThemed(mode, chartChrome.tooltipBg), border: `1px solid ${pickThemed(mode, chartChrome.tooltipBorder)}` }}
    >
      <p className="font-semibold text-text">{bucket.rangeLabel} pontos</p>
      <p className="font-mono text-text-secondary">
        {bucket.count} projeto{bucket.count === 1 ? "" : "s"} · clique para filtrar
      </p>
    </div>
  );
}
