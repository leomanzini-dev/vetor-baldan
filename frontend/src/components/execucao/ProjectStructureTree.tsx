import { useMemo, useState } from "react";
import { ChevronRight, CheckCircle2, CircleDot, Circle } from "lucide-react";
import type { MicroStage, Phase, PhaseStatus, Stage } from "@/types/domain";
import type { Person } from "@/types/domain";

const statusMeta: Record<PhaseStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  concluida: { label: "Concluída", classes: "bg-success-soft text-success", icon: CheckCircle2 },
  "em-andamento": { label: "Em andamento", classes: "bg-info-soft text-info", icon: CircleDot },
  pendente: { label: "Pendente", classes: "bg-app-alt text-text-tertiary", icon: Circle },
};

function StatusPill({ status }: { status: PhaseStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${meta.classes}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function MicroStageRow({ micro, person }: { micro: MicroStage; person?: Person }) {
  const meta = statusMeta[micro.status];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-app-alt/60">
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${
          micro.status === "concluida" ? "text-success" : micro.status === "em-andamento" ? "text-info" : "text-text-tertiary"
        }`}
      />
      <p className="min-w-0 flex-1 truncate text-[12.5px] text-text-secondary">{micro.name}</p>
      <span className="shrink-0 text-[11px] font-mono text-text-tertiary">
        {micro.hours}h · {micro.points}pt
      </span>
      {person && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-alt text-[9.5px] font-bold text-text-secondary">
          {person.avatarInitials}
        </span>
      )}
    </div>
  );
}

function StageRow({ stage, microStages, people }: { stage: Stage; microStages: MicroStage[]; people: Person[] }) {
  const [open, setOpen] = useState(false);
  const items = microStages.filter((m) => m.stageId === stage.id);

  return (
    <div className="ml-4 border-l border-border pl-3">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2.5 rounded-md py-1.5 text-left">
        <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-text-tertiary transition-transform ${open ? "rotate-90" : ""}`} />
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-text">{stage.name}</span>
        <StatusPill status={stage.status} />
      </button>
      {open && (
        <div className="mb-1 ml-2 flex flex-col">
          {items.map((m) => (
            <MicroStageRow key={m.id} micro={m} person={people.find((p) => p.id === m.assigneeId)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  phases: Phase[];
  stages: Stage[];
  microStages: MicroStage[];
  people: Person[];
}

export function ProjectStructureTree({ phases, stages, microStages, people }: Props) {
  const initialOpen = useMemo(
    () => new Set(phases.filter((p) => p.status === "em-andamento").map((p) => p.id)),
    [phases]
  );
  const [openPhases, setOpenPhases] = useState<Set<string>>(initialOpen);

  function togglePhase(id: string) {
    setOpenPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {phases.map((phase) => {
        const open = openPhases.has(phase.id);
        const phaseStages = stages.filter((s) => s.phaseId === phase.id);
        return (
          <div key={phase.id} className="rounded-md border border-border">
            <button onClick={() => togglePhase(phase.id)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nav font-mono text-[11px] font-bold text-nav-text">
                {phase.order}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-text">{phase.name}</span>
              <StatusPill status={phase.status} />
              <ChevronRight className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
            {open && (
              <div className="flex flex-col gap-1 border-t border-border px-3.5 py-2.5">
                {phaseStages.map((stage) => (
                  <StageRow key={stage.id} stage={stage} microStages={microStages} people={people} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
