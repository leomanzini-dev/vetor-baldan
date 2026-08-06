import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed } from "@/config/chartPalette";
import { formatCurrencyK } from "@/lib/format";
import type { Project } from "@/types/domain";

interface Props {
  projects: Project[];
}

interface TooltipPayloadEntry {
  payload: { code: string; name: string; vplValueK: number };
}

function ChartTooltip({ active, payload, bg, border }: { active?: boolean; payload?: TooltipPayloadEntry[]; bg: string; border: string }) {
  if (!active || !payload?.length) return null;
  const { code, name, vplValueK } = payload[0].payload;
  return (
    <div className="rounded-md px-3 py-2 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="font-semibold text-text">
        {code} · {name}
      </p>
      <p className="text-text-secondary">
        VPL: <span className="font-mono font-semibold text-text">{formatCurrencyK(vplValueK)}</span>
      </p>
    </div>
  );
}

export function TopVplChart({ projects }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);
  const primary = pickThemed(mode, { light: "#CB0A26", dark: "#E23A52" });

  const chartData = projects.map((p) => ({ code: p.code, name: p.name, vplValueK: p.vplValueK }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barSize={14}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="code"
          width={64}
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />}
        />
        <Bar
          dataKey="vplValueK"
          fill={primary}
          radius={[0, 4, 4, 0]}
          label={{
            position: "right",
            fill: axisColor,
            fontSize: 11,
            fontWeight: 600,
            formatter: (v: string | number | boolean | null | undefined) => (typeof v === "number" ? formatCurrencyK(v) : v),
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
