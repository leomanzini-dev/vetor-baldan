import { useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { CapacitySummary, Project } from "@/types/domain";

interface Props {
  summary: CapacitySummary[];
  projectsById: Map<string, Project>;
}

const PAGE_SIZE = 5;

export function CapacityBoard({ summary, projectsById }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(summary[0]?.person.id ?? null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const computed = summary;
  const selected = computed.find((s) => s.person.id === selectedId) ?? computed[0];
  const visible = computed.slice(0, visibleCount);
  const remaining = computed.length - visible.length;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col gap-3">
      <div className="flex flex-col divide-y divide-border">
        {visible.map((s) => {
          const capPct = s.monthlyCapacityPoints > 0 ? (s.pointsEarned / s.monthlyCapacityPoints) * 100 : 0;
          const committedPct = s.monthlyCapacityPoints > 0 ? (s.pointsCommitted / s.monthlyCapacityPoints) * 100 : 0;
          const overloaded = s.pointsCommitted > s.monthlyCapacityPoints;
          const isSelected = s.person.id === selectedId;
          return (
            <button
              key={s.person.id}
              onClick={() => setSelectedId(s.person.id)}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors ${
                isSelected ? "bg-primary-soft" : "hover:bg-app-alt"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nav text-[12px] font-bold text-nav-text">
                {s.person.avatarInitials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold text-text">{s.person.name}</p>
                  {overloaded && <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-warning" />}
                </div>
                <p className="truncate text-[11px] text-text-tertiary">
                  {s.person.role} · {s.person.dailyHours}h/dia
                </p>
                <div className="relative mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-app-alt">
                  {committedPct > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-warning/40"
                      style={{ width: `${Math.min(committedPct, 100)}%` }}
                    />
                  )}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-success"
                    style={{ width: `${Math.min(capPct, 100)}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-right font-mono text-[11px] text-text-tertiary">
                {s.pointsEarned}/{s.monthlyCapacityPoints}
                <span className="block text-[9px] uppercase tracking-wide">pontos</span>
              </span>
            </button>
          );
        })}
      </div>
      {remaining > 0 && (
        <button
          onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
          className="self-center rounded-md border border-border bg-surface px-4 py-2 text-[12px] font-bold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          Carregar mais ({remaining})
        </button>
      )}
      </div>

      {selected && (
        <div className="rounded-md border border-border bg-app-alt/40 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-text">{selected.person.name}</p>
              <p className="text-[11.5px] text-text-tertiary">{selected.person.role}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[18px] font-bold text-primary">
                {selected.pointsEarned}
                <span className="text-[12px] text-text-tertiary">/{selected.monthlyCapacityPoints}</span>
              </p>
              <p className="text-[10px] uppercase tracking-wide text-text-tertiary">pontos no mês</p>
            </div>
          </div>

          {selected.pointsCommitted > selected.monthlyCapacityPoints && (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-warning-soft bg-warning-soft px-3 py-2 text-[11.5px] text-warning">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
              Carga comprometida ({selected.pointsCommitted} pts) acima da capacidade mensal — considerar redistribuir
              micro-etapas.
            </div>
          )}

          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
            Micro-etapas do mês · a conclusão é feita pelo responsável em Minhas Tarefas
          </p>
          <div className="flex flex-col gap-1.5">
            {selected.microStages.map((m) => {
              const project = projectsById.get(m.projectId);
              const done = m.status === "concluida";
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                      done ? "border-success bg-success text-white" : "border-border-strong text-transparent"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-[12.5px] ${done ? "text-text-tertiary line-through" : "text-text"}`}>
                      {m.name}
                    </p>
                    <p className="truncate text-[10.5px] text-text-tertiary">
                      {project ? `${project.code} · ${project.name}` : m.projectId} · até {formatDate(m.dueDate)}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-semibold text-text-secondary">
                    {m.hours}h · {m.points}pt
                  </span>
                </div>
              );
            })}
            {selected.microStages.length === 0 && (
              <p className="py-6 text-center text-[12.5px] text-text-tertiary">
                Nenhuma micro-etapa atribuída neste mês.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
