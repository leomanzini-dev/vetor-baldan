import { funnelStageLabels, trlRampDark, trlRampLight } from "@/config/chartPalette";
import { useThemeStore } from "@/store/themeStore";
import type { FunnelStageId } from "@/types/domain";

const stageOrder: FunnelStageId[] = ["captacao", "triagem", "avaliacao", "gate", "execucao", "encerrado"];

interface Props {
  data: { stage: FunnelStageId; count: number }[];
}

// Estágios do funil são uma ORDEM (não identidade) — cor ordinal de um único
// tom, mais escuro = mais avançado, em vez de uma cor arbitrária por estágio.
function stageColor(index: number, mode: "light" | "dark"): string {
  const ramp = mode === "dark" ? trlRampDark : trlRampLight;
  const rampIndex = Math.round((index * (ramp.length - 1)) / (stageOrder.length - 1));
  return ramp[rampIndex];
}

function stageIsDark(index: number): boolean {
  return Math.round((index * 8) / (stageOrder.length - 1)) >= 4;
}

export function FunnelPanel({ data }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {stageOrder.map((stage, i) => {
        const entry = data.find((d) => d.stage === stage);
        const count = entry?.count ?? 0;
        const widthPct = Math.max((count / max) * 100, count > 0 ? 6 : 0);
        const color = stageColor(i, mode);
        const labelIsLight = stageIsDark(i);
        return (
          <div key={stage} className="flex items-center gap-3">
            <span className="w-[84px] shrink-0 text-[12px] font-medium text-text-secondary">
              {funnelStageLabels[stage]}
            </span>
            <div className="h-6 flex-1 overflow-hidden rounded-full bg-app-alt">
              <div
                className="flex h-full items-center justify-end rounded-full px-2.5 transition-all"
                style={{ width: `${widthPct}%`, backgroundColor: color }}
              >
                {widthPct > 14 && (
                  <span className={`text-[11px] font-bold ${labelIsLight ? "text-white" : "text-[#141413]"}`}>
                    {count}
                  </span>
                )}
              </div>
            </div>
            {widthPct <= 14 && (
              <span className="w-6 shrink-0 text-[11px] font-bold text-text">{count}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
