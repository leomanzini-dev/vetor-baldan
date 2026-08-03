import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useProjects, usePeople, useProjectTypes, useVerticals } from "@/hooks/usePortfolio";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { funnelStageLabels } from "@/config/chartPalette";
import { formatCurrencyK, formatDate, formatPercent } from "@/lib/format";
import type { FunnelStageId, ProjectTypeId, VerticalId } from "@/types/domain";

const PAGE_SIZE = 8;
const funnelOrder: FunnelStageId[] = ["captacao", "triagem", "avaliacao", "gate", "execucao", "encerrado"];

export function ProjectCatalog() {
  const [search, setSearch] = useState("");
  const [vertical, setVertical] = useState<VerticalId | "">("");
  const [type, setType] = useState<ProjectTypeId | "">("");
  const [funnelStage, setFunnelStage] = useState<FunnelStageId | "">("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: verticals } = useVerticals();
  const { data: types } = useProjectTypes();
  const { data: people } = usePeople();

  const { data } = useProjects({
    search: search || undefined,
    vertical: vertical || undefined,
    type: type || undefined,
    funnelStage: funnelStage || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const selected = useMemo(() => items.find((p) => p.id === selectedId) ?? items[0], [items, selectedId]);

  function resetPage() {
    setPage(0);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2.5">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Buscar por nome ou código..."
              className="w-full rounded-md border border-border bg-app-alt py-2 pl-9 pr-3 text-[12.5px] text-text placeholder:text-text-tertiary outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
            />
          </div>
          <select
            value={vertical}
            onChange={(e) => {
              setVertical(e.target.value as VerticalId | "");
              resetPage();
            }}
            className="rounded-md border border-border bg-app-alt px-2.5 py-2 text-[12.5px] text-text outline-none focus:border-primary"
          >
            <option value="">Todas as verticais</option>
            {verticals?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as ProjectTypeId | "");
              resetPage();
            }}
            className="rounded-md border border-border bg-app-alt px-2.5 py-2 text-[12.5px] text-text outline-none focus:border-primary"
          >
            <option value="">Todos os tipos</option>
            {types?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={funnelStage}
            onChange={(e) => {
              setFunnelStage(e.target.value as FunnelStageId | "");
              resetPage();
            }}
            className="rounded-md border border-border bg-app-alt px-2.5 py-2 text-[12.5px] text-text outline-none focus:border-primary"
          >
            <option value="">Todo o funil</option>
            {funnelOrder.map((f) => (
              <option key={f} value={f}>
                {funnelStageLabels[f]}
              </option>
            ))}
          </select>
        </div>

        <ul className="flex flex-col divide-y divide-border">
          {items.map((project) => (
            <li key={project.id}>
              <button
                onClick={() => setSelectedId(project.id)}
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors ${
                  (selected?.id ?? items[0]?.id) === project.id ? "bg-primary-soft" : "hover:bg-app-alt"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-text">{project.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-[10.5px] text-text-tertiary">{project.code}</span>
                    <VerticalBadge vertical={project.vertical} />
                    <span className="text-[10.5px] text-text-tertiary">{funnelStageLabels[project.funnelStage]}</span>
                  </div>
                </div>
                <HealthBadge health={project.health} />
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="py-8 text-center text-[13px] text-text-tertiary">Nenhum projeto encontrado.</li>}
        </ul>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-[11.5px] text-text-tertiary">
            {total} projeto{total !== 1 ? "s" : ""} · página {page + 1} de {pageCount}
          </p>
          <div className="flex gap-1.5">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-app-alt/40 p-4">
        {selected ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-mono text-[11px] text-text-tertiary">{selected.code}</p>
              <h4 className="text-[16px] font-semibold text-text">{selected.name}</h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <VerticalBadge vertical={selected.vertical} />
                <HealthBadge health={selected.health} />
                <span className="text-[11px] text-text-tertiary">{funnelStageLabels[selected.funnelStage]}</span>
              </div>
            </div>

            <p className="text-[12.5px] leading-relaxed text-text-secondary">{selected.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="TIR" value={formatPercent(selected.tirPercent)} />
              <Stat label="VPL" value={formatCurrencyK(selected.vplValueK)} />
              <Stat label="Orçamento" value={formatCurrencyK(selected.budgetK)} />
              <Stat label="TRL" value={`${selected.trl} / 9`} />
              <Stat label="Início" value={formatDate(selected.startDate)} />
              <Stat label="Entrega prevista" value={formatDate(selected.targetDate)} />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Líder</p>
                <p className="text-[12.5px] font-medium text-text">
                  {people?.find((p) => p.id === selected.leaderId)?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Sponsor</p>
                <p className="text-[12.5px] font-medium text-text">
                  {people?.find((p) => p.id === selected.sponsorId)?.name ?? "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-[13px] text-text-tertiary">Selecione um projeto na lista.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="font-mono text-[13px] font-semibold text-text">{value}</p>
    </div>
  );
}
