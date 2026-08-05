import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { ScoredProject } from "@/lib/priority";

interface Props {
  top: ScoredProject[];
  deltas: Record<string, number>;
  version: number;
  onViewFull: () => void;
}

export function LiveRankingPanel({ top, deltas, version, onViewFull }: Props) {
  return (
    <div className="flex flex-col rounded-card border border-border bg-surface shadow-token-sm lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Top 10 ao vivo</h3>
          </div>
          <p className="mt-1 text-[12px] text-text-tertiary">Recalculado agora</p>
        </div>
        <button
          onClick={onViewFull}
          className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          Ranking completo
        </button>
      </div>

      <ul className="flex flex-col gap-1 p-2.5">
        <AnimatePresence initial={false}>
          {top.map((s, i) => {
            const rank = i + 1;
            const delta = deltas[s.project.id] ?? 0;
            return (
              <motion.li
                key={s.project.id}
                layout
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="relative overflow-hidden rounded-md"
              >
                {delta !== 0 && (
                  <motion.span
                    key={`flash-${s.project.id}-${version}`}
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 ${delta > 0 ? "bg-success" : "bg-danger"}`}
                    initial={{ opacity: 0.28 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.3, ease: "easeOut" }}
                  />
                )}
                <div className="relative flex items-center gap-2.5 px-2.5 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-app-alt font-mono text-[11px] font-bold text-text-secondary">
                    {rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-text">{s.project.name}</p>
                    <p className="font-mono text-[10px] text-text-tertiary">{s.project.code}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[14px] font-bold text-primary">{s.total.toFixed(0)}</span>
                  <DeltaBadge delta={delta} />
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return <Minus className="h-3 w-3 shrink-0 text-text-tertiary/50" aria-label="Sem mudança de posição" />;
  }
  const up = delta > 0;
  return (
    <span
      className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${
        up ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      }`}
      title={up ? `Subiu ${delta} posição(ões)` : `Desceu ${Math.abs(delta)} posição(ões)`}
    >
      {up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(delta)}
    </span>
  );
}
