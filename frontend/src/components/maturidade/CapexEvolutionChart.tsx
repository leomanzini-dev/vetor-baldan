import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, pickThemed } from "@/config/chartPalette";
import { formatCurrencyK } from "@/lib/format";
import type { CapexYearEntry } from "@/lib/roadmap";

function ChartTooltip({
  active,
  payload,
  label,
  bg,
  border,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
  bg: string;
  border: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md px-3 py-2 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="font-mono font-semibold text-text">{label}</p>
      <p className="text-text-secondary">
        CAPEX comprometido: <span className="font-mono font-semibold text-text">{formatCurrencyK(payload[0].value)}</span>
      </p>
    </div>
  );
}

export function CapexEvolutionChart({ data }: { data: CapexYearEntry[] }) {
  const mode = useThemeStore((s) => s.mode);
  const axisColor = pickThemed(mode, chartChrome.axisText);
  const gridColor = pickThemed(mode, chartChrome.gridline);
  const primary = pickThemed(mode, { light: "#CB0A26", dark: "#E23A52" });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="capex-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primary} stopOpacity={0.28} />
            <stop offset="100%" stopColor={primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          tick={{ fill: axisColor, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 11 }}
          width={44}
          tickFormatter={(v) => formatCurrencyK(v)}
        />
        <Tooltip content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />} />
        <Area
          type="monotone"
          dataKey="capexK"
          stroke={primary}
          strokeWidth={2.5}
          fill="url(#capex-fill)"
          dot={{ r: 3, fill: primary, stroke: "none" }}
          isAnimationActive
          animationDuration={600}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
