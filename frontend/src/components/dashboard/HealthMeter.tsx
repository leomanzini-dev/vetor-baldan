import type { PortfolioSummary } from "@/types/domain";

export interface HealthScoreResult {
  score: number; // 0-100
  tier: "success" | "warning" | "danger";
  label: string;
}

// Índice composto de saúde do portfólio: metade do peso vem da distribuição
// on-track/atenção/crítico (o que já é visível no resto do painel), a outra
// metade vem do ritmo real de execução (SPI/CPI médios, normalizados contra
// 1.0 = exatamente no plano). Não é um número "mágico" — é uma combinação
// legível dos mesmos indicadores que já aparecem em outros cards, só que
// resumidos num único número para leitura executiva rápida.
export function computeHealthScore(summary: PortfolioSummary): HealthScoreResult {
  const total = summary.onTrackCount + summary.attentionCount + summary.criticalCount || 1;
  const mixScore = (summary.onTrackCount * 100 + summary.attentionCount * 55 + summary.criticalCount * 10) / total;

  const normSpi = (Math.min(Math.max(summary.avgSpi, 0), 1.2) / 1.2) * 100;
  const normCpi = (Math.min(Math.max(summary.avgCpi, 0), 1.2) / 1.2) * 100;

  const score = Math.round(mixScore * 0.5 + normSpi * 0.25 + normCpi * 0.25);

  if (score >= 80) return { score, tier: "success", label: "Saudável" };
  if (score >= 55) return { score, tier: "warning", label: "Atenção" };
  return { score, tier: "danger", label: "Crítico" };
}

const tierClasses = {
  success: { fill: "bg-success", track: "bg-success-soft", text: "text-success" },
  warning: { fill: "bg-warning", track: "bg-warning-soft", text: "text-warning" },
  danger: { fill: "bg-danger", track: "bg-danger-soft", text: "text-danger" },
} as const;

export function HealthMeter({ result }: { result: HealthScoreResult }) {
  const cls = tierClasses[result.tier];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          Índice de Saúde do Portfólio
        </span>
        <span className={`text-[11px] font-bold ${cls.text}`}>{result.label}</span>
      </div>
      <div className={`h-2.5 w-full overflow-hidden rounded-full ${cls.track}`}>
        <div
          className={`h-full rounded-full ${cls.fill} transition-[width] duration-700 ease-out`}
          style={{ width: `${result.score}%` }}
        />
      </div>
    </div>
  );
}
