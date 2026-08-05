import type { ScoredProject } from "@/lib/priority";

export interface PriorityBand {
  id: "prioritario" | "alto" | "medio" | "baixo";
  label: string;
  count: number;
  minScore: number;
  maxScore: number;
}

// Divide o ranking já ordenado em 4 quartis por posição (não por corte fixo de
// nota) — assim a composição fica sempre equilibrada, qualquer que seja a
// configuração de pesos usada no momento.
export function computePriorityBands(ranked: ScoredProject[]): PriorityBand[] {
  const n = ranked.length;
  if (n === 0) {
    return (["prioritario", "alto", "medio", "baixo"] as const).map((id) => ({
      id,
      label: bandLabels[id],
      count: 0,
      minScore: 0,
      maxScore: 0,
    }));
  }

  const size = Math.ceil(n / 4);
  const slices = [ranked.slice(0, size), ranked.slice(size, size * 2), ranked.slice(size * 2, size * 3), ranked.slice(size * 3)];
  const ids = ["prioritario", "alto", "medio", "baixo"] as const;

  return ids.map((id, i) => {
    const slice = slices[i];
    const scores = slice.map((s) => s.total);
    return {
      id,
      label: bandLabels[id],
      count: slice.length,
      maxScore: scores.length ? Math.max(...scores) : 0,
      minScore: scores.length ? Math.min(...scores) : 0,
    };
  });
}

const bandLabels: Record<PriorityBand["id"], string> = {
  prioritario: "Prioritário",
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export interface HistogramBucket {
  rangeLabel: string;
  from: number;
  to: number;
  count: number;
}

// Bins adaptativos no range real dos scores calculados (não 0-100 fixo) —
// com pesos livres o total quase nunca varre a escala inteira, então um
// histograma de bins fixos ficaria vazio na maior parte das barras.
export function computeScoreHistogram(ranked: ScoredProject[], binCount = 8): HistogramBucket[] {
  if (ranked.length === 0) return [];
  const totals = ranked.map((s) => s.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const span = Math.max(max - min, 1);
  const step = span / binCount;

  const buckets: HistogramBucket[] = Array.from({ length: binCount }, (_, i) => {
    const from = min + i * step;
    const to = i === binCount - 1 ? max : min + (i + 1) * step;
    return { rangeLabel: `${Math.round(from)}–${Math.round(to)}`, from, to, count: 0 };
  });

  for (const total of totals) {
    const idx = Math.min(Math.floor((total - min) / step), binCount - 1);
    buckets[idx].count += 1;
  }

  return buckets;
}
