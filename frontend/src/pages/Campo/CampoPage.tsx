import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ListChecks,
  Trophy,
  User,
  Play,
  Check,
  Ban,
  X,
  Clock,
  AlertCircle,
  FolderKanban,
  Zap,
  Sun,
  Moon,
  ChevronLeft,
  Send,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { usePersonaStore } from "@/store/personaStore";
import { usePeople, useProjects } from "@/hooks/usePortfolio";
import { useMergedCapacitySummary } from "@/hooks/useExecutionData";
import { useMicroStagesStore } from "@/store/microStagesStore";
import { useResourceRequestsStore } from "@/store/resourceRequestsStore";
import { verticalNames } from "@/config/verticals";
import { parseLocalDate, formatDate } from "@/lib/format";
import { expectedPointsToDate, paceStatus, daysInMonth } from "@/lib/executionPace";
import type { MicroStage, MicroStageStatus, Person, Project } from "@/types/domain";
import "./campo.css";

type Tab = "inicio" | "tarefas" | "pontos" | "perfil";
type FilterId = "todas" | "pendente" | "em-andamento" | "concluida";
type Tone = "danger" | "warn" | "info" | "success" | "neutral";

const THEME_KEY = "vetor-campo-theme";

const navItems: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "tarefas", label: "Tarefas", icon: ListChecks },
  { id: "pontos", label: "Pontos", icon: Trophy },
  { id: "perfil", label: "Perfil", icon: User },
];

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

function taskMeta(task: MicroStage, impediment: string | undefined) {
  const dueTime = parseLocalDate(task.dueDate).setHours(0, 0, 0, 0);
  const isOverdue = task.status !== "concluida" && dueTime < startOfToday();
  const isToday = task.status !== "concluida" && dueTime === startOfToday();
  const isBlocked = task.status !== "concluida" && !!impediment;

  let tone: Tone = "neutral";
  let label = "Pendente";
  let pulse = false;

  if (isBlocked) {
    tone = "danger";
    label = "Impedida";
  } else if (task.status === "concluida") {
    tone = "success";
    label = "Concluída";
  } else if (isOverdue) {
    tone = "danger";
    label = "Atrasada";
    pulse = true;
  } else if (isToday) {
    tone = "warn";
    label = "Hoje";
    pulse = true;
  } else if (task.status === "em-andamento") {
    tone = "info";
    label = "Em andamento";
  }

  return { isOverdue, isToday, isBlocked, tone, label, pulse };
}

/* ═══════════ Bottom sheets ═══════════ */

function ReforcoSheet({
  projects,
  onClose,
  onPick,
}: {
  projects: Project[];
  onClose: () => void;
  onPick: (projectId: string) => void;
}) {
  return (
    <div className="campo-sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="campo-sheet">
        <div className="campo-sheet-grip" />
        <h3>Precisa de reforço?</h3>
        <p className="sub">Escolha o projeto — o gestor recebe sua solicitação na hora.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onPick(project.id)}
              className="campo-switch-item"
            >
              <span className="campo-switch-avatar">
                <FolderKanban size={14} />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--c-text)" }}>{project.code}</span>
                <span style={{ display: "block", fontSize: 11, color: "var(--c-text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {project.name}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageSheet({
  title,
  subtitle,
  placeholder,
  confirmLabel,
  confirmIcon: ConfirmIcon,
  onClose,
  onSubmit,
}: {
  title: string;
  subtitle: string;
  placeholder: string;
  confirmLabel: string;
  confirmIcon: typeof Send;
  onClose: () => void;
  onSubmit: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  return (
    <div className="campo-sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="campo-sheet">
        <div className="campo-sheet-grip" />
        <h3>{title}</h3>
        <p className="sub">{subtitle}</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="campo-textarea"
        />
        <button
          onClick={() => message.trim() && onSubmit(message.trim())}
          disabled={!message.trim()}
          className="campo-btn is-primary"
          style={{ width: "100%", marginTop: 12, opacity: message.trim() ? 1 : 0.5 }}
        >
          <ConfirmIcon size={16} />
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

/* ═══════════ Task card ═══════════ */

function TaskItem({
  task,
  project,
  impediment,
  onAdvance,
  onImpediment,
  onClearImpediment,
}: {
  task: MicroStage;
  project?: Project;
  impediment?: string;
  onAdvance: (id: string) => void;
  onImpediment: (id: string) => void;
  onClearImpediment: (id: string) => void;
}) {
  const meta = taskMeta(task, impediment);

  return (
    <article className={`campo-task tone-${meta.tone} ${task.status === "concluida" ? "is-done" : ""}`}>
      <div className="campo-task-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="campo-task-title">{task.name}</p>
          <p className="campo-task-id">{project ? `${project.code} · ` : ""}{formatDate(task.dueDate)}</p>
        </div>
        <span className={`campo-status tone-${meta.tone}`}>
          {meta.pulse && <span className="pulse" />}
          {meta.label}
        </span>
      </div>

      <div className="campo-task-body">
        <div className={`campo-row ${meta.isOverdue ? "is-urgent" : ""}`}>
          {meta.isOverdue ? <AlertCircle /> : <Clock />}
          <span>
            {task.status === "concluida"
              ? <>Entregue <span className="v">{task.completedDate ? `em ${formatDate(task.completedDate)}` : "agora"}</span></>
              : <>Prazo: <span className="v">{formatDate(task.dueDate)}</span></>}
          </span>
        </div>
        {project && (
          <div className="campo-row">
            <FolderKanban />
            <span className="v">{project.name}</span>
          </div>
        )}
        <div className="campo-row">
          <Zap />
          <span>{task.hours}h de trabalho · <span className="v">{task.points} pts</span></span>
        </div>
      </div>

      {meta.isBlocked && (
        <div className="campo-impediment">
          <Ban />
          <span style={{ flex: 1 }}>{impediment}</span>
          <button onClick={() => onClearImpediment(task.id)} aria-label="Remover impedimento">
            <X size={14} />
          </button>
        </div>
      )}

      {task.status !== "concluida" && (
        <div className="campo-actions">
          {!meta.isBlocked && (
            <button onClick={() => onImpediment(task.id)} className="campo-btn is-ghost" aria-label="Relatar impedimento" title="Relatar impedimento">
              <Ban />
            </button>
          )}
          {task.status === "pendente" && (
            <button onClick={() => onAdvance(task.id)} className="campo-btn is-primary">
              <Play fill="currentColor" />
              Iniciar
            </button>
          )}
          {task.status === "em-andamento" && (
            <button onClick={() => onAdvance(task.id)} className="campo-btn is-success">
              <Check strokeWidth={3} />
              Concluir
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/* ═══════════ Página principal ═══════════ */

export function CampoPage() {
  const navigate = useNavigate();
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

  const [tab, setTab] = useState<Tab>("inicio");
  const [filter, setFilter] = useState<FilterId>("todas");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [reforcoOpen, setReforcoOpen] = useState(false);
  const [reforcoProjectId, setReforcoProjectId] = useState<string | null>(null);
  const [impedimentFor, setImpedimentFor] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }

  const person = people?.find((p) => p.id === activePersonId);
  const executors = useMemo(() => people?.filter((p) => p.profile === "executor") ?? [], [people]);
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
  const filtered = filter === "todas" ? tasks : tasks.filter((t) => t.status === filter);
  const priorityTasks = tasks.filter((t) => t.status !== "concluida").slice(0, 3);

  const myProjects = useMemo(() => {
    const ids = new Set(tasks.filter((t) => t.status !== "concluida").map((t) => t.projectId));
    return Array.from(ids).map((id) => projectsById.get(id)).filter((p): p is Project => !!p);
  }, [tasks, projectsById]);

  const pointsEarned = mySummary?.pointsEarned ?? 0;
  const capacityGoal = mySummary?.monthlyCapacityPoints ?? 0;
  const expected = expectedPointsToDate(capacityGoal);
  const pace = paceStatus(pointsEarned, expected);
  const goalPct = capacityGoal > 0 ? Math.min(100, Math.round((pointsEarned / capacityGoal) * 100)) : 0;
  const dayOfMonth = new Date().getDate();
  const totalDays = daysInMonth(new Date());

  function advance(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setStatus(id, nextStatus(task.status));
  }

  function openReforco() {
    if (myProjects.length === 1) {
      setReforcoProjectId(myProjects[0].id);
    } else {
      setReforcoOpen(true);
    }
  }

  function submitReforco(message: string) {
    if (!reforcoProjectId || !person) return;
    addRequest({ projectId: reforcoProjectId, personId: person.id, message });
    setReforcoProjectId(null);
    setReforcoOpen(false);
  }

  function submitImpediment(reason: string) {
    if (!impedimentFor) return;
    setImpediment(impedimentFor, reason);
    setImpedimentFor(null);
  }

  const greeting = getGreeting(new Date().getHours());
  const firstName = person?.name.split(" ")[0] ?? "";
  const todayLabel = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" }).toUpperCase();
  const isNotExecutor = !!person && person.profile !== "executor";
  const reforcoProject = reforcoProjectId ? projectsById.get(reforcoProjectId) : undefined;
  const impedimentTask = impedimentFor ? tasks.find((t) => t.id === impedimentFor) : undefined;

  return (
    <div className="campo-root" data-campo-theme={theme}>
      <div className="campo-shell">
        <header className="campo-header">
          <div className="campo-user">
            <button className="campo-avatar" onClick={() => setTab("perfil")} aria-label="Perfil">
              {person?.avatarInitials ?? "—"}
            </button>
            <div className="campo-greet">
              <div className="campo-greet-hi">{greeting},</div>
              <div className="campo-greet-name">{firstName || "Colaborador"} 👷</div>
            </div>
          </div>
          <button className="campo-icon-btn is-primary" onClick={toggleTheme} aria-label="Alternar tema">
            {theme === "dark" ? <Moon /> : <Sun />}
          </button>
          <button className="campo-icon-btn" onClick={() => navigate("/colaborador")} aria-label="Voltar ao painel">
            <ChevronLeft />
          </button>
        </header>

        {isNotExecutor ? (
          <div className="campo-section">
            <div className="campo-card">
              <p style={{ fontSize: 13, color: "var(--c-text2)", marginBottom: 12 }}>
                {person?.name} está logado como outro perfil. Escolha um colaborador para ver o VETOR Campo:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {executors.map((ex) => (
                  <button key={ex.id} onClick={() => setActivePerson(ex.id)} className="campo-switch-item">
                    <span className="campo-switch-avatar">{ex.avatarInitials}</span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", fontSize: 12.5, fontWeight: 700 }}>{ex.name}</span>
                      <span style={{ display: "block", fontSize: 10.5, color: "var(--c-text2)" }}>{ex.role}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {tab === "inicio" && (
              <>
                <section className="campo-today">
                  <div className="campo-today-date">{todayLabel}</div>
                  <h1 className="campo-today-title">
                    Você tem <span>{needsActionToday} tarefa{needsActionToday === 1 ? "" : "s"}</span> pra hoje.
                  </h1>
                  <p className="campo-today-sub">Vamos ao que importa 💪</p>
                </section>

                <section className="campo-stats">
                  <div className="campo-stat is-featured">
                    <div className="campo-stat-num">{needsActionToday}</div>
                    <div className="campo-stat-label">Hoje</div>
                  </div>
                  <div className="campo-stat">
                    <div className="campo-stat-num">{counts.pendente + counts["em-andamento"]}</div>
                    <div className="campo-stat-label">Pendentes</div>
                  </div>
                  <div className="campo-stat">
                    <div className="campo-stat-num">{pointsEarned}</div>
                    <div className="campo-stat-label">Pontos/mês</div>
                  </div>
                </section>

                <section className="campo-section" style={{ paddingTop: 4 }}>
                  <p className="campo-h2">Prioridade agora</p>
                  {priorityTasks.length === 0 ? (
                    <div className="campo-empty">
                      <CheckCircle2 />
                      <p>Nenhuma tarefa pendente — tudo em dia!</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                      {priorityTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          project={projectsById.get(task.projectId)}
                          impediment={impediments[task.id]}
                          onAdvance={advance}
                          onImpediment={setImpedimentFor}
                          onClearImpediment={clearImpediment}
                        />
                      ))}
                    </div>
                  )}
                  {tasks.length > priorityTasks.length && (
                    <button onClick={() => setTab("tarefas")} className="campo-link-btn">
                      <ListChecks />
                      Ver todas as {tasks.length} tarefas
                    </button>
                  )}
                </section>
              </>
            )}

            {tab === "tarefas" && (
              <>
                <nav className="campo-filters">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`campo-chip ${filter === f.id ? "active" : ""}`}
                    >
                      {f.label}
                      <span className="count">{counts[f.id]}</span>
                    </button>
                  ))}
                </nav>
                <section className="campo-list">
                  {filtered.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      project={projectsById.get(task.projectId)}
                      impediment={impediments[task.id]}
                      onAdvance={advance}
                      onImpediment={setImpedimentFor}
                      onClearImpediment={clearImpediment}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <div className="campo-empty">
                      <Sparkles />
                      <p>Nenhuma tarefa nesse filtro.</p>
                    </div>
                  )}
                </section>
              </>
            )}

            {tab === "pontos" && (
              <section className="campo-section">
                <div className="campo-card">
                  <p className="campo-h2" style={{ marginBottom: 12 }}>Meta do mês</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 32, color: "var(--c-primary)" }}>
                      {pointsEarned}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--c-text2)" }}>/ {capacityGoal} pts</span>
                  </div>
                  <div className="campo-progress-track">
                    <div className="campo-progress-fill" style={{ width: `${goalPct}%` }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                    <span className={`campo-pace tone-${pace === "em-dia" ? "success" : "danger"}`}>
                      {pace === "em-dia" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {pace === "em-dia" ? "Em dia" : "Atrasado"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--c-text3)" }}>
                      Dia {dayOfMonth} de {totalDays} · esperado {expected} pts
                    </span>
                  </div>
                </div>

                <div className="campo-card">
                  <p className="campo-h2" style={{ marginBottom: 12 }}>Suas entregas</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 22, color: "var(--c-text)" }}>{counts.concluida}</p>
                      <p style={{ fontSize: 10, color: "var(--c-text2)", fontWeight: 700, textTransform: "uppercase" }}>Concluídas</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 22, color: "var(--c-text)" }}>{counts["em-andamento"]}</p>
                      <p style={{ fontSize: 10, color: "var(--c-text2)", fontWeight: 700, textTransform: "uppercase" }}>Em andamento</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 22, color: "var(--c-text)" }}>{counts.pendente}</p>
                      <p style={{ fontSize: 10, color: "var(--c-text2)", fontWeight: 700, textTransform: "uppercase" }}>Pendentes</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "perfil" && (
              <section className="campo-section">
                <div className="campo-card">
                  <div className="campo-profile-head">
                    <span className="campo-profile-avatar">{person?.avatarInitials}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 18, color: "var(--c-text)" }}>{person?.name}</p>
                      <p style={{ fontSize: 12, color: "var(--c-text2)" }}>{person?.role}</p>
                      {person?.vertical && (
                        <p style={{ fontSize: 11, color: "var(--c-primary)", fontWeight: 700, marginTop: 2 }}>{verticalNames[person.vertical]}</p>
                      )}
                    </div>
                  </div>
                  <div className="campo-toggle-row">
                    <span style={{ fontSize: 12.5, color: "var(--c-text2)" }}>Tema escuro</span>
                    <button onClick={toggleTheme} className="campo-icon-btn is-primary">
                      {theme === "dark" ? <Moon /> : <Sun />}
                    </button>
                  </div>
                </div>

                {executors.length > 1 && (
                  <div className="campo-card">
                    <p className="campo-h2" style={{ marginBottom: 10 }}>Trocar colaborador</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {executors.map((ex: Person) => (
                        <button
                          key={ex.id}
                          onClick={() => setActivePerson(ex.id)}
                          className={`campo-switch-item ${ex.id === activePersonId ? "active" : ""}`}
                        >
                          <span className="campo-switch-avatar">{ex.avatarInitials}</span>
                          <span style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--c-text)" }}>{ex.name}</span>
                            <span style={{ display: "block", fontSize: 10.5, color: "var(--c-text2)" }}>{ex.role}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => navigate("/colaborador")} className="campo-link-btn">
                  <LayoutDashboard />
                  Voltar ao painel (desktop)
                </button>
              </section>
            )}

            {myProjects.length > 0 && tab !== "perfil" && (
              <button className="campo-fab" onClick={openReforco}>
                <UserPlus />
                Reforço
              </button>
            )}

            <nav className="campo-bnav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`campo-bnav-item ${tab === item.id ? "active" : ""}`}
                >
                  <item.icon />
                  {item.label}
                </button>
              ))}
            </nav>
          </>
        )}
      </div>

      {reforcoOpen && !reforcoProjectId && (
        <ReforcoSheet
          projects={myProjects}
          onClose={() => setReforcoOpen(false)}
          onPick={(id) => setReforcoProjectId(id)}
        />
      )}

      {reforcoProjectId && reforcoProject && (
        <MessageSheet
          title="Solicitar reforço"
          subtitle={`${reforcoProject.code} · ${reforcoProject.name}`}
          placeholder="Explique por que precisa de mais gente nesse projeto…"
          confirmLabel="Enviar ao gestor"
          confirmIcon={Send}
          onClose={() => { setReforcoProjectId(null); setReforcoOpen(false); }}
          onSubmit={submitReforco}
        />
      )}

      {impedimentFor && (
        <MessageSheet
          title="Relatar impedimento"
          subtitle={impedimentTask?.name ?? ""}
          placeholder="O que está bloqueando essa entrega?"
          confirmLabel="Marcar como impedida"
          confirmIcon={Ban}
          onClose={() => setImpedimentFor(null)}
          onSubmit={submitImpediment}
        />
      )}
    </div>
  );
}
