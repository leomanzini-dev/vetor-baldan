import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LayoutGrid, Sparkles, User, ArrowLeft, ChevronRight } from "lucide-react";
import { usePersonaStore } from "@/store/personaStore";
import { usePeople, useProjects, useCapacitySummary } from "@/hooks/usePortfolio";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TaskCard } from "@/components/colaborador/TaskCard";
import { profileLabels } from "@/config/profiles";
import { parseLocalDate } from "@/lib/format";
import type { MicroStageStatus } from "@/types/domain";

type FilterId = "todas" | "pendente" | "em-andamento" | "concluida";
type TabId = "tarefas" | "pontos" | "perfil";

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

export function ColaboradorPage() {
  const navigate = useNavigate();
  const activePersonId = usePersonaStore((s) => s.activePersonId);
  const setActivePerson = usePersonaStore((s) => s.setActivePerson);

  const { data: people } = usePeople();
  const { data: projectsData } = useProjects({ limit: 500 });
  const { data: capacity } = useCapacitySummary();

  const [filter, setFilter] = useState<FilterId>("todas");
  const [tab, setTab] = useState<TabId>("tarefas");
  const [overrides, setOverrides] = useState<Record<string, MicroStageStatus>>({});

  const person = people?.find((p) => p.id === activePersonId);
  const executors = people?.filter((p) => p.profile === "executor") ?? [];
  const projectsById = useMemo(() => new Map((projectsData?.items ?? []).map((p) => [p.id, p])), [projectsData]);

  const mySummary = capacity?.summary.find((s) => s.person.id === activePersonId);

  const tasks = useMemo(() => {
    if (!mySummary) return [];
    return mySummary.microStages
      .map((m) => ({ ...m, status: overrides[m.id] ?? m.status }))
      .sort((a, b) => parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime());
  }, [mySummary, overrides]);

  const counts = {
    todas: tasks.length,
    pendente: tasks.filter((t) => t.status === "pendente").length,
    "em-andamento": tasks.filter((t) => t.status === "em-andamento").length,
    concluida: tasks.filter((t) => t.status === "concluida").length,
  };

  const needsActionToday = tasks.filter((t) => t.status !== "concluida" && parseLocalDate(t.dueDate).setHours(0, 0, 0, 0) <= startOfToday()).length;

  const pointsEarned = tasks.filter((t) => t.status === "concluida").reduce((sum, t) => sum + t.points, 0);
  const capacityGoal = mySummary?.monthlyCapacityPoints ?? 0;

  const filtered = filter === "todas" ? tasks : tasks.filter((t) => t.status === filter);

  function advance(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setOverrides((prev) => ({ ...prev, [id]: nextStatus(task.status) }));
  }

  const greeting = getGreeting(new Date().getHours());
  const firstName = person?.name.split(" ")[0] ?? "";
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" }).toUpperCase();

  const isNotExecutor = !!person && person.profile !== "executor";

  if (isNotExecutor) {
    return (
      <div className="min-h-screen bg-app-alt sm:flex sm:items-center sm:justify-center sm:p-8">
        <div className="relative mx-auto flex min-h-screen w-full flex-col bg-app sm:h-[820px] sm:min-h-0 sm:max-w-[440px] sm:rounded-[32px] sm:border sm:border-border sm:shadow-token-lg">
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <User className="h-7 w-7" />
            </span>
            <div>
              <p className="text-[16px] font-bold text-text">Essa visão é para o perfil Executor</p>
              <p className="mt-1.5 text-[13px] text-text-secondary">
                {person?.name} está logado como {profileLabels[person!.profile]}. Escolha um colaborador para ver a
                versão de campo:
              </p>
            </div>
            <div className="flex w-full max-w-xs flex-col gap-1.5">
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
            <button
              onClick={() => navigate("/")}
              className="mt-2 flex items-center gap-2 text-[12.5px] font-semibold text-text-tertiary hover:text-text"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar para o painel executivo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-alt sm:flex sm:items-center sm:justify-center sm:p-8">
      <div className="relative mx-auto flex min-h-screen w-full flex-col bg-app pb-24 sm:h-[820px] sm:min-h-0 sm:max-w-[440px] sm:overflow-y-auto sm:rounded-[32px] sm:border sm:border-border sm:shadow-token-lg">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface px-[18px] py-4">
          <button
            onClick={() => setTab("perfil")}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-on-primary">
              {person?.avatarInitials ?? "—"}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-success" />
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] font-semibold text-text-tertiary">{greeting},</span>
              <span className="block truncate text-[17px] font-bold leading-tight text-text">{firstName || "Colaborador"} 👷</span>
            </span>
          </button>
          <ThemeToggle />
          <button
            aria-label="Notificações"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-app-alt text-text"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-surface bg-danger" />
          </button>
        </header>

        {tab === "tarefas" && (
          <>
            {/* Today banner */}
            <section className="px-5 pb-1.5 pt-4">
              <p className="mb-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-text-tertiary">{today}</p>
              <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text">
                {needsActionToday > 0 ? (
                  <>
                    Você tem <span className="text-primary">{needsActionToday} pendente{needsActionToday !== 1 ? "s" : ""}</span> pra hoje.
                  </>
                ) : (
                  <>
                    Nenhuma pendência <span className="text-primary">urgente</span> hoje.
                  </>
                )}
              </h1>
              <p className="mt-1.5 text-[13px] text-text-secondary">
                {needsActionToday > 0
                  ? "Cada entrega credita pontos na hora. Bora fechar a meta! 💪"
                  : `Você ainda tem ${counts.pendente + counts["em-andamento"]} micro-etapas no mês. Adianta o que puder! 💪`}
              </p>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-3 gap-2.5 px-5 pb-2 pt-4">
              <div className="rounded-2xl border border-border bg-surface px-3 py-3.5 text-center shadow-token-sm">
                <p className="text-[26px] font-bold leading-none text-text">{needsActionToday}</p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Hoje</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface px-3 py-3.5 text-center shadow-token-sm">
                <p className="text-[26px] font-bold leading-none text-text">{counts.pendente + counts["em-andamento"]}</p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Pendentes</p>
              </div>
              <div className="rounded-2xl border border-primary-soft bg-primary-soft px-3 py-3.5 text-center shadow-token-sm">
                <p className="text-[26px] font-bold leading-none text-primary">{pointsEarned}</p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-primary/70">Pontos no mês</p>
              </div>
            </section>

            {/* Filters */}
            <nav className="flex gap-2 overflow-x-auto px-5 pb-1.5 pt-4 [scrollbar-width:none]">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                    filter === f.id ? "bg-primary text-on-primary" : "border border-border bg-surface text-text-secondary"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                      filter === f.id ? "bg-black/15" : "bg-app-alt text-text-tertiary"
                    }`}
                  >
                    {counts[f.id]}
                  </span>
                </button>
              ))}
            </nav>

            {/* Task list */}
            <section className="flex flex-col gap-3.5 px-5 pb-6 pt-3">
              {filtered.map((task) => (
                <TaskCard key={task.id} task={task} project={projectsById.get(task.projectId)} onAdvance={advance} />
              ))}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-14 text-center">
                  <Sparkles className="h-6 w-6 text-text-tertiary" />
                  <p className="text-[13px] text-text-tertiary">Nenhuma micro-etapa nesse filtro.</p>
                </div>
              )}
            </section>
          </>
        )}

        {tab === "pontos" && mySummary && (
          <section className="flex flex-col gap-5 px-5 py-6">
            <div>
              <h2 className="text-[20px] font-bold text-text">Meus pontos</h2>
              <p className="mt-1 text-[13px] text-text-secondary">
                Meta mensal calculada a partir das suas {person?.dailyHours}h/dia de trabalho.
              </p>
            </div>

            <div className="rounded-card border border-primary-soft bg-primary-soft p-5 text-center">
              <p className="font-mono text-[40px] font-bold leading-none text-primary">{pointsEarned}</p>
              <p className="mt-2 text-[12px] font-bold uppercase tracking-wide text-primary/70">
                de {capacityGoal} pontos no mês
              </p>
              <div className="mx-auto mt-4 h-2.5 w-full max-w-[240px] overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${capacityGoal > 0 ? Math.min((pointsEarned / capacityGoal) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-[22px] font-bold text-text">{counts["em-andamento"]}</p>
                <p className="mt-1 text-[11px] font-semibold text-text-tertiary">Em andamento</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-[22px] font-bold text-text">{counts.concluida}</p>
                <p className="mt-1 text-[11px] font-semibold text-text-tertiary">Concluídas no mês</p>
              </div>
            </div>

            <p className="text-[11.5px] leading-relaxed text-text-tertiary">
              Cada micro-etapa converte suas horas estimadas em pontos (parâmetro definido pela liderança em
              Central de Parametrização). Ao marcar uma entrega como concluída, os pontos são creditados na hora.
            </p>
          </section>
        )}

        {tab === "perfil" && person && (
          <section className="flex flex-col gap-5 px-5 py-6">
            <div className="flex items-center gap-3.5 rounded-card border border-border bg-surface p-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-[18px] font-bold text-on-primary">
                {person.avatarInitials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold text-text">{person.name}</p>
                <p className="truncate text-[12.5px] text-text-secondary">{person.role}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-primary">{profileLabels[person.profile]}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Trocar de colaborador</p>
              <div className="flex flex-col gap-1.5">
                {executors.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setActivePerson(ex.id)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      ex.id === activePersonId ? "border-primary bg-primary-soft" : "border-border bg-surface"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-alt text-[11px] font-bold text-text-secondary">
                      {ex.avatarInitials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-text">{ex.name}</span>
                      <span className="block truncate text-[10.5px] text-text-tertiary">{ex.role}</span>
                    </span>
                    {ex.id === activePersonId && <ChevronRight className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 rounded-btn border border-border bg-surface py-3 text-[13px] font-bold text-text-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver painel executivo completo
            </button>
          </section>
        )}

        {/* Bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-border bg-surface px-2 py-2 sm:absolute">
          {(
            [
              { id: "tarefas" as TabId, label: "Tarefas", icon: LayoutGrid },
              { id: "pontos" as TabId, label: "Pontos", icon: Sparkles },
              { id: "perfil" as TabId, label: "Perfil", icon: User },
            ]
          ).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10.5px] font-bold transition-colors ${
                  active ? "text-primary" : "text-text-tertiary"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
