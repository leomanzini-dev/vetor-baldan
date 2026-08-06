import { Sparkles } from "lucide-react";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { useAllLenses } from "@/hooks/useLenses";
import { usePeople } from "@/hooks/usePortfolio";
import { buildRankExplanation } from "@/lib/explainability";
import { formatCurrencyK, formatDate, formatIndex, formatPercent } from "@/lib/format";
import { timeProgressFraction } from "@/lib/execution";
import type { ScoredProject } from "@/lib/priority";

interface Props {
  scored: ScoredProject;
  rank: number;
  totalCount: number;
}

// Verde ≥1 (no ritmo/orçamento), âmbar 0.85–1 (leve desvio), vermelho <0.85
// (desvio relevante) — os mesmos limiares usados nos sinais de IA do painel.
function indexTone(value: number | null): "success" | "warning" | "danger" | "muted" {
  if (value === null) return "muted";
  if (value >= 1) return "success";
  if (value >= 0.85) return "warning";
  return "danger";
}

const toneText: Record<ReturnType<typeof indexTone>, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  muted: "text-text-tertiary",
};

function StatTile({ label, value, tone = "text-text" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border border-border bg-app-alt/50 px-3 py-2.5">
      <p className="text-[9.5px] font-bold uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className={`mt-0.5 truncate font-mono text-[14px] font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export function ExplainabilityPanel({ scored, rank, totalCount }: Props) {
  const { project, contributions, total } = scored;
  const maxContribution = Math.max(...contributions.map((c) => c.contribution), 1);
  const explanation = buildRankExplanation(scored, rank, totalCount);
  const allLenses = useAllLenses();
  const { data: people } = usePeople();

  const leader = people?.find((p) => p.id === project.leaderId);
  const sponsor = people?.find((p) => p.id === project.sponsorId);
  const roi = project.budgetK > 0 ? project.vplValueK / project.budgetK : null;
  const budgetUsedPct = project.budgetK > 0 ? (project.spentK / project.budgetK) * 100 : null;
  const timeProgressPct = timeProgressFraction(project) * 100;

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

      <div>
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Indicadores</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatTile label="TRL" value={`${project.trl} / 9`} />
          <StatTile label="SPI" value={project.spi !== null ? formatIndex(project.spi) : "—"} tone={toneText[indexTone(project.spi)]} />
          <StatTile label="CPI" value={project.cpi !== null ? formatIndex(project.cpi) : "—"} tone={toneText[indexTone(project.cpi)]} />
          <StatTile label="TIR" value={formatPercent(project.tirPercent, 0)} />
          <StatTile label="VPL" value={formatCurrencyK(project.vplValueK)} />
          <StatTile label="ROI (VPL/CAPEX)" value={roi !== null ? `${roi.toFixed(2)}x` : "—"} />
          <StatTile label="CAPEX" value={formatCurrencyK(project.budgetK)} />
          <StatTile
            label="Realizado"
            value={formatCurrencyK(project.spentK)}
            tone={budgetUsedPct !== null && budgetUsedPct > 100 ? "text-danger" : "text-text"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-md border border-border bg-app-alt/30 p-3.5 sm:grid-cols-2">
        <div>
          <p className="mb-1 flex items-baseline justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-text-tertiary">Prazo</span>
            <span className="font-mono text-text-tertiary">{formatIndex(timeProgressPct)}%</span>
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-app-alt">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(Math.max(timeProgressPct, 0), 100)}%` }}
            />
          </div>
          <p className="mt-1 text-[10.5px] text-text-tertiary">
            {formatDate(project.startDate)} — {formatDate(project.targetDate)}
          </p>
        </div>
        <div>
          <p className="mb-1 flex items-baseline justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-text-tertiary">Orçamento utilizado</span>
            <span className="font-mono text-text-tertiary">{budgetUsedPct !== null ? `${formatIndex(budgetUsedPct)}%` : "—"}</span>
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-app-alt">
            <div
              className={`h-full rounded-full ${budgetUsedPct !== null && budgetUsedPct > 100 ? "bg-danger" : "bg-info"}`}
              style={{ width: `${Math.min(budgetUsedPct ?? 0, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-[10.5px] text-text-tertiary">
            {formatCurrencyK(project.spentK)} de {formatCurrencyK(project.budgetK)}
          </p>
        </div>
      </div>

      {(leader || sponsor) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
          {leader && (
            <p>
              <span className="text-text-tertiary">Líder — </span>
              <span className="font-semibold text-text">{leader.name}</span>
            </p>
          )}
          {sponsor && (
            <p>
              <span className="text-text-tertiary">Patrocinador — </span>
              <span className="font-semibold text-text">{sponsor.name}</span>
            </p>
          )}
        </div>
      )}

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
