import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useThemeStore } from "@/store/themeStore";
import { chartChrome, lensCategoricalRamp, pickThemed } from "@/config/chartPalette";
import type { LensAverage } from "@/lib/lensStats";

interface TooltipPayloadEntry {
  payload: { label: string; avgScore: number };
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
  const { label, avgScore } = payload[0].payload;
  return (
    <div className="rounded-md px-3 py-2 text-[12px] shadow-token-md" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="font-semibold text-text">{label}</p>
      <p className="text-text-secondary">média {avgScore.toFixed(1)} / 100</p>
    </div>
  );
}

// Perfil estratégico do portfólio: uma série única (a média do portfólio),
// então cor única de identidade (slot 1) em vez de uma cor por lente — as
// lentes aqui são categorias nominais sem ordem própria, então recolorir
// cada barra reencodaria o que o comprimento já mostra.
export function LensProfileChart({ data }: { data: LensAverage[] }) {
  const mode = useThemeStore((s) => s.mode);
  const color = pickThemed(mode, lensCategoricalRamp[0]);
  const axisColor = pickThemed(mode, chartChrome.axisText);

  const chartData = data.map((d) => ({ ...d, label: d.label }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barSize={16}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="short"
          width={92}
          tickLine={false}
          axisLine={false}
          tick={{ fill: axisColor, fontSize: 12, fontFamily: "Inter, sans-serif" }}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={<ChartTooltip bg={pickThemed(mode, chartChrome.tooltipBg)} border={pickThemed(mode, chartChrome.tooltipBorder)} />}
        />
        <Bar
          dataKey="avgScore"
          fill={color}
          radius={[0, 4, 4, 0]}
          label={{
            position: "right",
            fill: axisColor,
            fontSize: 12,
            fontWeight: 600,
            formatter: (v: string | number | boolean | null | undefined) => (typeof v === "number" ? v.toFixed(0) : v),
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
