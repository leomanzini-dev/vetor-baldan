import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, TrendingDown, Send, X, Ban, Smartphone, ArrowRight } from "lucide-react";
import { usePersonaStore } from "@/store/personaStore";
import { usePeople, useProjects } from "@/hooks/usePortfolio";
import { useMergedCapacitySummary } from "@/hooks/useExecutionData";
import { useMicroStagesStore } from "@/store/microStagesStore";
import { useResourceRequestsStore } from "@/store/resourceRequestsStore";
import { TaskCard } from "@/components/colaborador/TaskCard";
import { Panel } from "@/components/ui/Panel";
import { VerticalBadge } from "@/components/ui/Badge";
import { profileLabels } from "@/config/profiles";
import { parseLocalDate } from "@/lib/format";
import { expectedPointsToDate, paceStatus } from "@/lib/executionPace";
import type { MicroStageStatus } from "@/types/domain";

type FilterId = "todas" | "pendente" | "em-andamento" | "concluida";

const filters: { id: FilterId; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "pendente", label: "Pendente" },
  { id: "em-andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
];

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function nextStatus(status: MicroStageStatus): MicroStageStatus {
  if (status === "pendente") return "em-andamento";
  if (status === "em-andamento") return "concluida";
  return status;
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function RequestHelpModal({
  projectName,
  onClose,
  onSubmit,
}: {
  projectName: string;
  onClose: () => void;
  onSubmit: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-card border border-border bg-surface p-5 shadow-token-lg"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-bold text-text">Solicitar reforço</p>
            <p className="mt-0.5 text-[12px] text-text-tertiary">{projectName}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-text-tertiary hover:text-text">
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Explique por que precisa de mais pessoas nesse projeto (ex.: carga de horas acima da capacidade do mês)…"
          rows={4}
          className="w-full resize-none rounded-md border border-border bg-app-alt/40 px-3 py-2.5 text-[13px] text-text"
        />
        <button
          onClick={() => message.trim() && onSubmit(message.trim())}
          disabled={!message.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-btn bg-primary py-2.5 text-[13px] font-bold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Enviar solicitação ao gestor
        </button>
      </div>
    </div>
  );
}

function ImpedimentModal({
  taskName,
  onClose,
  onSubmit,
}: {
  taskName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-card border border-border bg-surface p-5 shadow-token-lg"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-bold text-text">Relatar impedimento</p>
            <p className="mt-0.5 text-[12px] text-text-tertiary">{taskName}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-text-tertiary hover:text-text">
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="O que está bloqueando essa entrega? (ex.: aguardando peça de fornecedor, dependendo de outra equipe)…"
          rows={4}
          className="w-full resize-none rounded-md border border-border bg-app-alt/40 px-3 py-2.5 text-[13px] text-text"
        />
        <button
          onClick={() => reason.trim() && onSubmit(reason.trim())}
          disabled={!reason.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-btn bg-danger py-2.5 text-[13px] font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          <Ban className="h-4 w-4" />
          Marcar como impedida
        </button>
      </div>
    </div>
  );
}

export function ColaboradorPage() {
  const activePersonId = usePersonaStore((s) => s.activePersonId);
  const setActivePerson = usePersonaStore((s) => s.setActivePerson);

  const { data: capacity } = useMergedCapacitySummary();
  const { data: people } = usePeople();
  const { data: projectsData } = useProjects({ limit: 500 });
  const setStatus = useMicroStagesStore((s) => s.setStatus);
  const impediments = useMicroStagesStore((s) => s.impediments);
  const setImpediment = useMicroStagesStore((s) => s.setImpediment);
  const clearImpediment = useMicroStagesStore((s) => s.clearImpediment);
  const addRequest = useResourceRequestsStore((s) => s.addRequest);

  const [filter, setFilter] = useState<FilterId>("todas");
  const [requestFor, setRequestFor] = useState<string | null>(null);
  const [impedimentFor, setImpedimentFor] = useState<string | null>(null);

  const person = people?.find((p) => p.id === activePersonId);
  const executors = people?.filter((p) => p.profile === "executor") ?? [];
  const projectsById = useMemo(() => new Map((projectsData?.items ?? []).map((p) => [p.id, p])), [projectsData]);

  const mySummary = capacity?.summary.find((s) => s.person.id === activePersonId);

  const tasks = useMemo(() => {
    if (!mySummary) return [];
    return [...mySummary.microStages].sort((a, b) => parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime());
  }, [mySummary]);

  const counts = {
    todas: tasks.length,
    pendente: tasks.filter((t) => t.status === "pendente").length,
    "em-andamento": tasks.filter((t) => t.status === "em-andamento").length,
    concluida: tasks.filter((t) => t.status === "concluida").length,
  };

  const needsActionToday = tasks.filter((t) => t.status !== "concluida" && parseLocalDate(t.dueDate).setHours(0, 0, 0, 0) <= startOfToday()).length;

  const pointsEarned = mySummary?.pointsEarned ?? 0;
  const capacityGoal = mySummary?.monthlyCapacityPoints ?? 0;
  const expected = expectedPointsToDate(capacityGoal);
  const pace = paceStatus(pointsEarned, expected);

  const filtered = filter === "todas" ? tasks : tasks.filter((t) => t.status === filter);

  const myProjects = useMemo(() => {
    const ids = new Set(tasks.filter((t) => t.status !== "concluida").map((t) => t.projectId));
    return Array.from(ids)
      .map((id) => projectsById.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [tasks, projectsById]);

  function advance(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setStatus(id, nextStatus(task.status));
  }

  function submitRequest(message: string) {
    if (!requestFor || !person) return;
    addRequest({ projectId: requestFor, personId: person.id, message });
    setRequestFor(null);
  }

  function submitImpediment(reason: string) {
    if (!impedimentFor) return;
    setImpediment(impedimentFor, reason);
    setImpedimentFor(null);
  }

  const greeting = getGreeting(new Date().getHours());
  const firstName = person?.name.split(" ")[0] ?? "";
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" }).toUpperCase();
  const isNotExecutor = !!person && person.profile !== "executor";
  const requestProject = requestFor ? projectsById.get(requestFor) : undefined;

  if (isNotExecutor) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-text">Minhas Tarefas</h1>
          <p className="mt-1 text-[13px] text-text-tertiary">Visão de rotina diária do executor.</p>
        </div>
        <Panel title="Essa visão é para o perfil Executor" subtitle={`${person?.name} está logado como ${profileLabels[person!.profile]}`}>
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-text-secondary">Escolha um colaborador para ver a versão de campo:</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {executors.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setActivePerson(ex.id)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-primary/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-alt text-[11px] font-bold text-text-secondary">
                    {ex.avatarInitials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold text-text">{ex.name}</span>
                    <span className="block truncate text-[10.5px] text-text-tertiary">{ex.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-on-primary">
            {person?.avatarInitials ?? "—"}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-app bg-success" />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-text-tertiary">
              {greeting}, {firstName || "Colaborador"} · {today}
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight text-text">Minhas Tarefas</h1>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Link
            to="/campo"
            className="flex items-center gap-1.5 rounded-btn bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            <Smartphone className="h-4 w-4" />
            Abrir VETOR Campo (mobile)
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <p className="text-[11.5px] text-text-tertiary">Troque de colaborador pelo seletor no topo da página</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-card border border-border bg-surface px-4 py-3.5 shadow-token-sm">
          <p className="text-[22px] font-bold leading-none text-text">{needsActionToday}</p>
          <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">Para hoje</p>
        </div>
        <div className="rounded-card border border-border bg-surface px-4 py-3.5 shadow-token-sm">
          <p className="text-[22px] font-bold leading-none text-text">{counts.pendente + counts["em-andamento"]}</p>
          <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">Pendentes no mês</p>
        </div>
        <div className="rounded-card border border-primary-soft bg-primary-soft px-4 py-3.5 shadow-token-sm">
          <p className="text-[22px] font-bold leading-none text-primary">
            {pointsEarned}
            <span className="text-[13px] text-primary/70">/{capacityGoal}</span>
          </p>
          <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-primary/70">Pontos no mês</p>
        </div>
        <div
          className={`rounded-card border px-4 py-3.5 shadow-token-sm ${
            pace === "em-dia" ? "border-success-soft bg-success-soft" : "border-danger-soft bg-danger-soft"
          }`}
        >
          <p className={`flex items-center gap-1.5 text-[15px] font-bold leading-none ${pace === "em-dia" ? "text-success" : "text-danger"}`}>
            {pace === "em-dia" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {pace === "em-dia" ? "Em dia" : "Atrasado"}
          </p>
          <p className={`mt-1.5 text-[10.5px] font-bold uppercase tracking-wide ${pace === "em-dia" ? "text-success/80" : "text-danger/80"}`}>
            Esperado até hoje: {expected} pts
          </p>
        </div>
      </div>

      {myProjects.length > 0 && (
        <Panel title="Precisa de reforço?" subtitle="Se a carga de algum projeto está acima das suas horas, avise o gestor por aqui">
          <div className="flex flex-col gap-2">
            {myProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
                <VerticalBadge vertical={project.vertical} />
                <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-text">
                  {project.code} · {project.name}
                </p>
                <button
                  onClick={() => setRequestFor(project.id)}
                  className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-[11.5px] font-bold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Solicitar reforço
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div>
        <nav className="mb-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                filter === f.id ? "bg-primary text-on-primary" : "border border-border bg-surface text-text-secondary"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${filter === f.id ? "bg-black/15" : "bg-app-alt text-text-tertiary"}`}>
                {counts[f.id]}
              </span>
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={projectsById.get(task.projectId)}
              impediment={impediments[task.id]}
              onAdvance={advance}
              onReportImpediment={setImpedimentFor}
              onClearImpediment={clearImpediment}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-14 text-center">
            <Sparkles className="h-6 w-6 text-text-tertiary" />
            <p className="text-[13px] text-text-tertiary">Nenhuma micro-etapa nesse filtro.</p>
          </div>
        )}
      </div>

      {requestFor && requestProject && (
        <RequestHelpModal projectName={`${requestProject.code} · ${requestProject.name}`} onClose={() => setRequestFor(null)} onSubmit={submitRequest} />
      )}

      {impedimentFor && (
        <ImpedimentModal
          taskName={tasks.find((t) => t.id === impedimentFor)?.name ?? ""}
          onClose={() => setImpedimentFor(null)}
          onSubmit={submitImpediment}
        />
      )}
    </div>
  );
}
