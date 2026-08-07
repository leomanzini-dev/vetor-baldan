import { useMemo, useState } from "react";
import { CheckCircle2, TriangleAlert, TrendingDown } from "lucide-react";
import { VerticalBadge, HealthBadge } from "@/components/ui/Badge";
import { personPaceStatus, type PersonPaceStatus } from "@/lib/executionPace";
import { PersonAllocationModal } from "@/components/execucao/PersonAllocationModal";
import type { CapacitySummary, Project } from "@/types/domain";

interface Props {
  summary: CapacitySummary[];
  projectsById: Map<string, Project>;
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
}

interface Assignee {
  personId: string;
  name: string;
  role: string;
  avatarInitials: string;
  status: PersonPaceStatus;
  monthlyCapacityPoints: number;
  pointsCommittedOverall: number;
  pointsEarnedOverall: number;
  pointsEarnedProject: number;
  pointsExpectedProject: number;
}

interface ProjectAllocation {
  project: Project;
  pointsEarned: number; // deste projeto, no mês
  pointsExpected: number; // micro-etapas deste projeto já vencidas no mês
  assignees: Assignee[];
  worstStatus: PersonPaceStatus;
}

const statusMeta: Record<PersonPaceStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  sobrecarregado: { label: "Sobrecarregado", className: "bg-danger-soft text-danger", icon: TriangleAlert },
  "nao-produtivo": { label: "Baixa produtividade", className: "bg-warning-soft text-warning", icon: TrendingDown },
  "em-dia": { label: "Em dia", className: "bg-success-soft text-success", icon: CheckCircle2 },
};

const statusPriority: Record<PersonPaceStatus, number> = { sobrecarregado: 2, "nao-produtivo": 1, "em-dia": 0 };

const PAGE_SIZE = 5;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ProjectAllocationPanel({ summary, projectsById, selectedProjectId, onSelectProject }: Props) {
  const [selected, setSelected] = useState<{ assignee: Assignee; project: Project } | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allocations = useMemo<ProjectAllocation[]>(() => {
    const today = todayKey();
    const byProject = new Map<
      string,
      { pointsEarned: number; pointsExpected: number; assignees: Map<string, Assignee> }
    >();

    for (const person of summary) {
      // status calculado sobre o TOTAL de pontos da pessoa (todos os projetos) —
      // é a pessoa que está sobrecarregada ou parada, não o projeto isolado.
      const status = personPaceStatus(person.monthlyCapacityPoints, person.pointsCommitted, person.pointsEarned);

      for (const m of person.microStages) {
        if (!byProject.has(m.projectId)) {
          byProject.set(m.projectId, { pointsEarned: 0, pointsExpected: 0, assignees: new Map() });
        }
        const bucket = byProject.get(m.projectId)!;

        if (!bucket.assignees.has(person.person.id)) {
          bucket.assignees.set(person.person.id, {
            personId: person.person.id,
            name: person.person.name,
            role: person.person.role,
            avatarInitials: person.person.avatarInitials,
            status,
            monthlyCapacityPoints: person.monthlyCapacityPoints,
            pointsCommittedOverall: person.pointsCommitted,
            pointsEarnedOverall: person.pointsEarned,
            pointsEarnedProject: 0,
            pointsExpectedProject: 0,
          });
        }
        const assignee = bucket.assignees.get(person.person.id)!;

        if (m.status === "concluida") {
          bucket.pointsEarned += m.points;
          assignee.pointsEarnedProject += m.points;
        }
        if (m.dueDate <= today) {
          bucket.pointsExpected += m.points;
          assignee.pointsExpectedProject += m.points;
        }
      }
    }

    const result: ProjectAllocation[] = [];
    for (const [projectId, bucket] of byProject) {
      const project = projectsById.get(projectId);
      if (!project) continue;
      const assignees = Array.from(bucket.assignees.values()).sort((a, b) => statusPriority[b.status] - statusPriority[a.status]);
      const worstStatus = assignees.reduce<PersonPaceStatus>(
        (worst, a) => (statusPriority[a.status] > statusPriority[worst] ? a.status : worst),
        "em-dia"
      );
      result.push({ project, pointsEarned: bucket.pointsEarned, pointsExpected: bucket.pointsExpected, assignees, worstStatus });
    }

    // Sempre ordenado do mais crítico para o menos — sem filtro, é a lista
    // inteira que o gestor precisa varrer, priorizada.
    return result.sort((a, b) => statusPriority[b.worstStatus] - statusPriority[a.worstStatus]);
  }, [summary, projectsById]);

  const visible = allocations.slice(0, visibleCount);
  const remaining = allocations.length - visible.length;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-text-tertiary">
        <span>Ordenado por criticidade · clique num responsável para uma análise da IA</span>
        <span className="flex items-center gap-3">
          {(Object.keys(statusMeta) as PersonPaceStatus[]).map((key) => (
            <span key={key} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${statusMeta[key].className.split(" ")[0]}`} />
              {statusMeta[key].label}
            </span>
          ))}
        </span>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {visible.map(({ project, pointsEarned, pointsExpected, assignees }) => (
          <div
            key={project.id}
            className={`flex flex-col gap-2.5 py-3 first:pt-0 last:pb-0 ${
              selectedProjectId === project.id ? "rounded-md bg-primary-soft/30 px-2.5 -mx-2.5" : ""
            }`}
          >
            <button
              onClick={() => onSelectProject?.(project.id)}
              className="flex flex-wrap items-start justify-between gap-3 rounded-md text-left transition-colors hover:bg-app-alt/60"
              title="Ver detalhamento deste projeto"
            >
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-text">{project.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-[11px] text-text-tertiary">{project.code}</span>
                  <VerticalBadge vertical={project.vertical} />
                  <HealthBadge health={project.health} />
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-app-alt px-2.5 py-1 text-[11px] font-bold text-text-secondary">
                TRL {project.trl}
              </span>
            </button>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-text-tertiary">
              <span>
                Pontos entregues x esperados até hoje:{" "}
                <span className={`font-semibold ${pointsEarned < pointsExpected ? "text-danger" : "text-text"}`}>
                  {pointsEarned}/{pointsExpected}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {assignees.map((a) => {
                const meta = statusMeta[a.status];
                const Icon = meta.icon;
                return (
                  <button
                    key={a.personId}
                    onClick={() => setSelected({ assignee: a, project })}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10.5px] font-medium transition-colors hover:brightness-95 ${
                      a.status === "em-dia" ? "border-border bg-app-alt text-text-secondary" : `border-transparent ${meta.className}`
                    }`}
                    title={`Ver análise da IA sobre ${a.name}`}
                  >
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-nav text-[8.5px] font-bold text-nav-text">
                      {a.avatarInitials}
                    </span>
                    {a.name.split(" ")[0]}
                    {a.status !== "em-dia" && <Icon className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {allocations.length === 0 && (
          <p className="py-8 text-center text-[12.5px] text-text-tertiary">Nenhum projeto com micro-etapas atribuídas neste mês.</p>
        )}
      </div>

      {remaining > 0 && (
        <button
          onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
          className="self-center rounded-md border border-border bg-surface px-4 py-2 text-[12px] font-bold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          Carregar mais ({remaining})
        </button>
      )}

      {selected && (
        <PersonAllocationModal person={selected.assignee} project={selected.project} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
