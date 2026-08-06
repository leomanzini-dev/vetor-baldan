import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { VerticalBadge } from "@/components/ui/Badge";
import { formatPercent } from "@/lib/format";
import type { ScoredProject } from "@/lib/priority";

const PAGE_SIZE = 10;

interface Props {
  scored: ScoredProject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RankingTable({ scored, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return scored;
    return scored.filter(
      (s) => s.project.name.toLowerCase().includes(term) || s.project.code.toLowerCase().includes(term)
    );
  }, [scored, search]);

  const pageCount = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar por nome ou código..."
          className="w-full rounded-md border border-border bg-app-alt py-2 pl-9 pr-3 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
        />
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {pageItems.map((s, i) => {
          const rank = currentPage * PAGE_SIZE + i + 1;
          const isSelected = s.project.id === selectedId;
          return (
            <li key={s.project.id}>
              <button
                onClick={() => onSelect(s.project.id)}
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors ${
                  isSelected ? "bg-primary-soft" : "hover:bg-app-alt"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[11.5px] font-bold ${
                    isSelected ? "bg-primary text-on-primary" : "bg-app-alt text-text-secondary"
                  }`}
                >
                  {rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-text">{s.project.name}</p>
                  <div className="mt-1 flex items-center gap-2.5">
                    <span className="font-mono text-[10.5px] text-text-tertiary">{s.project.code}</span>
                    <VerticalBadge vertical={s.project.vertical} />
                    <span className="text-[10.5px] text-text-tertiary">TIR {formatPercent(s.project.tirPercent, 0)}</span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[16px] font-bold text-primary">{s.total.toFixed(1)}</span>
              </button>
            </li>
          );
        })}
        {pageItems.length === 0 && (
          <li className="py-8 text-center text-[13px] text-text-tertiary">Nenhum projeto encontrado.</li>
        )}
      </ul>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <p className="text-[11.5px] text-text-tertiary">
          {filtered.length} projeto{filtered.length !== 1 ? "s" : ""} · página {currentPage + 1} de {pageCount}
        </p>
        <div className="flex gap-1.5">
          <button
            disabled={currentPage === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
