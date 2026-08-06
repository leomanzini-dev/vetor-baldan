import { useEffect } from "react";
import { X } from "lucide-react";
import { ExplainabilityPanel } from "@/components/priorizacao/ExplainabilityPanel";
import type { ScoredProject } from "@/lib/priority";

interface Props {
  scored: ScoredProject;
  rank: number;
  totalCount: number;
  onClose: () => void;
}

export function ProjectDetailModal({ scored, rank, totalCount, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-border bg-surface shadow-token-lg">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Detalhamento do Ranking</span>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-tertiary transition-colors hover:border-primary/40 hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">
          <ExplainabilityPanel scored={scored} rank={rank} totalCount={totalCount} />
        </div>
      </div>
    </div>
  );
}
