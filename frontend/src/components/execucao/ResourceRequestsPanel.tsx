import { Check, X, MailWarning } from "lucide-react";
import { useResourceRequestsStore } from "@/store/resourceRequestsStore";
import type { Person, Project } from "@/types/domain";

interface Props {
  projectsById: Map<string, Project>;
  peopleById: Map<string, Person>;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function ResourceRequestsPanel({ projectsById, peopleById }: Props) {
  const requests = useResourceRequestsStore((s) => s.requests);
  const setStatus = useResourceRequestsStore((s) => s.setStatus);

  const pending = requests.filter((r) => r.status === "pendente");
  const resolved = requests.filter((r) => r.status !== "pendente").slice(0, 5);

  if (requests.length === 0) {
    return (
      <p className="py-8 text-center text-[12.5px] text-text-tertiary">
        Nenhuma solicitação de reforço no momento — elas aparecem aqui quando um responsável pedir ajuda em Minhas
        Tarefas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          {pending.map((r) => {
            const project = projectsById.get(r.projectId);
            const person = peopleById.get(r.personId);
            return (
              <div key={r.id} className="flex flex-col gap-2 rounded-md border border-warning-soft bg-warning-soft/40 p-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
                    <MailWarning className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold text-text">
                      {person?.name ?? r.personId} · {project ? `${project.code} · ${project.name}` : r.projectId}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-text-secondary">{r.message}</p>
                    <p className="mt-0.5 text-[10.5px] text-text-tertiary">{formatDateTime(r.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pl-[38px]">
                  <button
                    onClick={() => setStatus(r.id, "atendida")}
                    className="flex items-center gap-1.5 rounded-md bg-success px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:opacity-90"
                  >
                    <Check className="h-3 w-3" />
                    Atender
                  </button>
                  <button
                    onClick={() => setStatus(r.id, "recusada")}
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-bold text-text-secondary transition-colors hover:border-danger/40 hover:text-danger"
                  >
                    <X className="h-3 w-3" />
                    Recusar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">Resolvidas recentemente</p>
          {resolved.map((r) => {
            const project = projectsById.get(r.projectId);
            const person = peopleById.get(r.personId);
            return (
              <div key={r.id} className="flex items-center gap-2 text-[11.5px] text-text-tertiary">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.status === "atendida" ? "bg-success" : "bg-danger"}`}
                />
                <span className="truncate">
                  {person?.name ?? r.personId} · {project?.code ?? r.projectId} — {r.status === "atendida" ? "atendida" : "recusada"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
