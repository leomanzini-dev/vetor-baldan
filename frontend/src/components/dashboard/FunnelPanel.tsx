import { funnelStageLabels } from "@/config/chartPalette";
import type { FunnelStageId } from "@/types/domain";

const stageOrder: FunnelStageId[] = ["captacao", "triagem", "avaliacao", "gate", "execucao", "encerrado"];

interface Props {
  data: { stage: FunnelStageId; count: number }[];
}

export function FunnelPanel({ data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {stageOrder.map((stage) => {
        const entry = data.find((d) => d.stage === stage);
        const count = entry?.count ?? 0;
        const widthPct = Math.max((count / max) * 100, count > 0 ? 6 : 0);
        return (
          <div key={stage} className="flex items-center gap-3">
            <span className="w-[84px] shrink-0 text-[12px] font-medium text-text-secondary">
              {funnelStageLabels[stage]}
            </span>
            <div className="h-6 flex-1 overflow-hidden rounded-full bg-app-alt">
              <div
                className="flex h-full items-center justify-end rounded-full bg-nav px-2.5 transition-all"
                style={{ width: `${widthPct}%` }}
              >
                {widthPct > 14 && (
                  <span className="text-[11px] font-bold text-nav-text">{count}</span>
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
