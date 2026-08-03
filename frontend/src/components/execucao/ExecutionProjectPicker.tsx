import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { formatIndex } from "@/lib/format";
import { timeProgressFraction } from "@/lib/execution";
import type { Project } from "@/types/domain";

interface Props {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ExecutionProjectPicker({ projects, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
  }, [projects, search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou código..."
          className="w-full rounded-md border border-border bg-app-alt py-2 pl-9 pr-3 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
        />
      </div>

      <ul className="flex max-h-[520px] flex-col divide-y divide-border overflow-y-auto">
        {filtered.map((project) => {
          const isSelected = project.id === selectedId;
          const progress = Math.round(timeProgressFraction(project) * 100);
          return (
            <li key={project.id}>
              <button
                onClick={() => onSelect(project.id)}
                className={`flex w-full flex-col gap-2 rounded-md px-2.5 py-2.5 text-left transition-colors ${
                  isSelected ? "bg-primary-soft" : "hover:bg-app-alt"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold text-text">{project.name}</p>
                  <HealthBadge health={project.health} />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10.5px] text-text-tertiary">{project.code}</span>
                  <VerticalBadge vertical={project.vertical} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-app-alt">
                    <div className="h-full rounded-full bg-nav" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right font-mono text-[10.5px] text-text-tertiary">{progress}%</span>
                </div>
                {project.spi !== null && project.cpi !== null && (
                  <div className="flex gap-3 text-[10.5px] text-text-tertiary">
                    <span>
                      SPI <span className="font-mono font-semibold text-text-secondary">{formatIndex(project.spi)}</span>
                    </span>
                    <span>
                      CPI <span className="font-mono font-semibold text-text-secondary">{formatIndex(project.cpi)}</span>
                    </span>
                  </div>
                )}
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-8 text-center text-[13px] text-text-tertiary">Nenhum projeto encontrado.</li>
        )}
      </ul>
    </div>
  );
}
