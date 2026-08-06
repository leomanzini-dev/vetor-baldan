import { Sparkles } from "lucide-react";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { useAllLenses } from "@/hooks/useLenses";
import { buildRankExplanation } from "@/lib/explainability";
import type { ScoredProject } from "@/lib/priority";

interface Props {
  scored: ScoredProject;
  rank: number;
  totalCount: number;
}

export function ExplainabilityPanel({ scored, rank, totalCount }: Props) {
  const { project, contributions, total } = scored;
  const maxContribution = Math.max(...contributions.map((c) => c.contribution), 1);
  const explanation = buildRankExplanation(scored, rank, totalCount);
  const allLenses = useAllLenses();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] text-text-tertiary">{project.code}</p>
          <h4 className="text-[16px] font-semibold text-text">{project.name}</h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <VerticalBadge vertical={project.vertical} />
            <HealthBadge health={project.health} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[24px] font-bold leading-none text-primary">{total.toFixed(1)}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
            posição #{rank}
          </p>
        </div>
      </div>

      <div className="flex gap-3 rounded-md border border-primary-soft bg-primary-soft/50 p-3.5">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-[12.5px] leading-relaxed text-text-secondary">{explanation}</p>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
          Contribuição por lente
        </p>
        <div className="flex flex-col gap-2.5">
          {contributions.map((c, i) => {
            const lens = allLenses.find((l) => l.id === c.lens)!;
            const widthPct = (c.contribution / maxContribution) * 100;
            const isTop = i === 0;
            return (
              <div key={c.lens}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className={`flex items-center gap-1.5 font-medium ${isTop ? "text-primary" : "text-text-secondary"}`}>
                    <lens.icon className="h-3.5 w-3.5" />
                    {lens.label}
                    {isTop && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-primary">
                        maior peso
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-text-tertiary">nota {c.score}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-app-alt">
                  <div
                    className={`h-full rounded-full transition-all ${isTop ? "bg-primary" : "bg-text-tertiary/50"}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
