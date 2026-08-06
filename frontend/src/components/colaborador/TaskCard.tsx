import { Play, Check, Clock, AlertCircle } from "lucide-react";
import { VerticalBadge } from "@/components/ui/Badge";
import { formatDate, parseLocalDate } from "@/lib/format";
import type { MicroStage, Project } from "@/types/domain";

interface Props {
  task: MicroStage;
  project?: Project;
  onAdvance: (id: string) => void;
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function TaskCard({ task, project, onAdvance }: Props) {
  const dueTime = parseLocalDate(task.dueDate).setHours(0, 0, 0, 0);
  const isOverdue = task.status !== "concluida" && dueTime < startOfToday();
  const isToday = task.status !== "concluida" && dueTime === startOfToday();

  const borderColor =
    task.status === "concluida"
      ? "before:bg-success"
      : isOverdue
        ? "before:bg-danger"
        : isToday
          ? "before:bg-warning"
          : task.status === "em-andamento"
            ? "before:bg-info"
            : "before:bg-border-strong";

  const badge =
    task.status === "concluida"
      ? { label: "Concluída", classes: "bg-success-soft text-success" }
      : task.status === "em-andamento"
        ? { label: "Em andamento", classes: "bg-info-soft text-info" }
        : isOverdue
          ? { label: "Atrasada", classes: "bg-danger-soft text-danger" }
          : isToday
            ? { label: "Hoje", classes: "bg-warning-soft text-warning" }
            : { label: "Pendente", classes: "bg-app-alt text-text-tertiary" };

  return (
    <article
      className={`relative overflow-hidden rounded-card border border-border bg-surface pl-[18px] shadow-token-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-[''] ${borderColor} ${
        task.status === "concluida" ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 px-4 pt-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight text-text">{task.name}</p>
          {project && (
            <p className="mt-0.5 font-mono text-[10.5px] text-text-tertiary">{project.code}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.classes}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 px-4 pb-3 pt-2.5">
        <div className={`flex items-center gap-2 text-[12.5px] ${isOverdue ? "font-bold text-danger" : "text-text-secondary"}`}>
          {isOverdue ? <AlertCircle className="h-[15px] w-[15px] shrink-0" /> : <Clock className="h-[15px] w-[15px] shrink-0 text-text-tertiary" />}
          {task.status === "concluida"
            ? `Entregue ${task.completedDate ? `em ${formatDate(task.completedDate)}` : "agora"}`
            : `Prazo: ${isOverdue ? "atrasada — era" : ""} ${formatDate(task.dueDate)}`}
        </div>
        {project && (
          <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
            <VerticalBadge vertical={project.vertical} />
            <span className="truncate text-text-tertiary">{project.name}</span>
          </div>
        )}
        <div className="font-mono text-[11.5px] text-text-tertiary">
          {task.hours}h de trabalho · <span className="font-bold text-primary">{task.points} pts</span>
        </div>
      </div>

      {task.status !== "concluida" && (
        <div className="flex gap-2 border-t border-dashed border-border px-4 py-3">
          {task.status === "pendente" && (
            <button
              onClick={() => onAdvance(task.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-primary py-2.5 text-[13px] font-bold text-on-primary transition-colors hover:bg-primary-hover"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Iniciar
            </button>
          )}
          {task.status === "em-andamento" && (
            <button
              onClick={() => onAdvance(task.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-success py-2.5 text-[13px] font-bold text-white transition-colors hover:opacity-90"
            >
              <Check className="h-4 w-4" strokeWidth={3} />
              Concluir entrega
            </button>
          )}
        </div>
      )}
    </article>
  );
}
