import { useMemo, useState } from "react";
import { Search, X, ArrowUpDown } from "lucide-react";
import { useProjects, usePeople, useProjectTypes, useVerticals } from "@/hooks/usePortfolio";
import { funnelStageLabels, healthColors } from "@/config/chartPalette";
import { ProjectTable } from "@/components/projetos/ProjectTable";
import { ProjectKanban } from "@/components/projetos/ProjectKanban";
import { ProjectDetailModal } from "@/components/projetos/ProjectDetailModal";
import type { FunnelStageId, Project, ProjectHealth, ProjectTypeId, VerticalId } from "@/types/domain";

const funnelOrder: FunnelStageId[] = ["captacao", "triagem", "avaliacao", "gate", "execucao", "encerrado"];
const healthOrder: ProjectHealth[] = ["critical", "attention", "on-track"];

type SortKey = "priority" | "vpl" | "budget" | "trl" | "name" | "recent";

const sortLabels: Record<SortKey, string> = {
  priority: "Prioridade",
  vpl: "Maior VPL",
  budget: "Maior orçamento",
  trl: "Maior TRL",
  name: "Nome (A-Z)",
  recent: "Mais recentes",
};

function sortProjects(projects: Project[], sort: SortKey): Project[] {
  const arr = [...projects];
  switch (sort) {
    case "vpl":
      return arr.sort((a, b) => b.vplValueK - a.vplValueK);
    case "budget":
      return arr.sort((a, b) => b.budgetK - a.budgetK);
    case "trl":
      return arr.sort((a, b) => b.trl - a.trl);
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    case "recent":
      return arr.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    case "priority":
    default:
      return arr.sort((a, b) => b.priorityScoreDefault - a.priorityScoreDefault);
  }
}

export type CatalogView = "tabela" | "kanban";

interface Props {
  view: CatalogView;
}

export function ProjectCatalog({ view }: Props) {
  const [search, setSearch] = useState("");
  const [vertical, setVertical] = useState<VerticalId | "">("");
  const [type, setType] = useState<ProjectTypeId | "">("");
  const [funnelStage, setFunnelStage] = useState<FunnelStageId | "">("");
  const [health, setHealth] = useState<ProjectHealth | "">("");
  const [sort, setSort] = useState<SortKey>("priority");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: verticals } = useVerticals();
  const { data: types } = useProjectTypes();
  const { data: people } = usePeople();
  const { data } = useProjects({ limit: 200 });

  const allProjects = useMemo(() => data?.items ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allProjects.filter((p) => {
      if (term && !p.name.toLowerCase().includes(term) && !p.code.toLowerCase().includes(term)) return false;
      if (vertical && p.vertical !== vertical) return false;
      if (type && p.type !== type) return false;
      if (view === "tabela" && funnelStage && p.funnelStage !== funnelStage) return false;
      if (health && p.health !== health) return false;
      return true;
    });
  }, [allProjects, search, vertical, type, funnelStage, health, view]);

  const sorted = useMemo(() => sortProjects(filtered, sort), [filtered, sort]);

  const selected = allProjects.find((p) => p.id === selectedId);
  const selectedType = selected ? types?.find((t) => t.id === selected.type) : undefined;

  const activeFilters = [
    vertical && { key: "vertical", label: verticals?.find((v) => v.id === vertical)?.name ?? vertical, clear: () => setVertical("") },
    type && { key: "type", label: types?.find((t) => t.id === type)?.name ?? type, clear: () => setType("") },
    view === "tabela" && funnelStage && { key: "funnel", label: funnelStageLabels[funnelStage], clear: () => setFunnelStage("") },
    health && { key: "health", label: healthColors[health].label, clear: () => setHealth("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  function clearAll() {
    setSearch("");
    setVertical("");
    setType("");
    setFunnelStage("");
    setHealth("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full rounded-md border border-border bg-app-alt py-2 pl-9 pr-3 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <select
          value={vertical}
          onChange={(e) => setVertical(e.target.value as VerticalId | "")}
          className="rounded-md border border-border bg-app-alt px-2.5 py-2 text-[12.5px] text-text outline-none focus:border-primary"
        >
          <option value="" className="bg-surface text-text">
            Todas as verticais
          </option>
          {verticals?.map((v) => (
            <option key={v.id} value={v.id} className="bg-surface text-text">
              {v.name}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ProjectTypeId | "")}
          className="rounded-md border border-border bg-app-alt px-2.5 py-2 text-[12.5px] text-text outline-none focus:border-primary"
        >
          <option value="" className="bg-surface text-text">
            Todos os tipos
          </option>
          {types?.map((t) => (
            <option key={t.id} value={t.id} className="bg-surface text-text">
              {t.name}
            </option>
          ))}
        </select>
        {view === "tabela" && (
          <select
            value={funnelStage}
            onChange={(e) => setFunnelStage(e.target.value as FunnelStageId | "")}
            className="rounded-md border border-border bg-app-alt px-2.5 py-2 text-[12.5px] text-text outline-none focus:border-primary"
          >
            <option value="" className="bg-surface text-text">
              Todo o funil
            </option>
            {funnelOrder.map((f) => (
              <option key={f} value={f} className="bg-surface text-text">
                {funnelStageLabels[f]}
              </option>
            ))}
          </select>
        )}
        <select
          value={health}
          onChange={(e) => setHealth(e.target.value as ProjectHealth | "")}
          className="rounded-md border border-border bg-app-alt px-2.5 py-2 text-[12.5px] text-text outline-none focus:border-primary"
        >
          <option value="" className="bg-surface text-text">
            Todas as saúdes
          </option>
          {healthOrder.map((h) => (
            <option key={h} value={h} className="bg-surface text-text">
              {healthColors[h].label}
            </option>
          ))}
        </select>
        {view === "tabela" && (
          <div className="relative flex items-center gap-1.5 rounded-md border border-border bg-app-alt px-2.5 py-2">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-transparent text-[12.5px] text-text outline-none"
            >
              {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                <option key={key} value={key} className="bg-surface text-text">
                  {sortLabels[key]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {(activeFilters.length > 0 || search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-text-tertiary">
            {sorted.length} projeto{sorted.length !== 1 ? "s" : ""} encontrado{sorted.length !== 1 ? "s" : ""}
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              "{search}"
              <X className="h-3 w-3" />
            </button>
          )}
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={f.clear}
              className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              {f.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button onClick={clearAll} className="text-[11px] font-semibold text-text-tertiary underline-offset-2 hover:underline">
            Limpar tudo
          </button>
        </div>
      )}

      {view === "tabela" ? (
        <ProjectTable projects={sorted} people={people ?? []} types={types ?? []} onSelectProject={setSelectedId} />
      ) : (
        <ProjectKanban projects={sorted} people={people ?? []} onSelectProject={setSelectedId} />
      )}

      {selected && (
        <ProjectDetailModal
          project={selected}
          leader={people?.find((p) => p.id === selected.leaderId)}
          sponsor={people?.find((p) => p.id === selected.sponsorId)}
          typeLabel={selectedType?.name}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
