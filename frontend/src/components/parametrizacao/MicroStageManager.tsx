import { useEffect, useMemo, useState } from "react";
import { Link2, Trash2, ListChecks, ArrowRightLeft } from "lucide-react";
import { useExecutingProjects, usePeople } from "@/hooks/usePortfolio";
import { useParamsStore } from "@/store/paramsStore";
import { useMicroStagesStore } from "@/store/microStagesStore";
import { useTrlProcessTemplateStore } from "@/store/trlProcessTemplateStore";
import { templateKey } from "@/config/trlProcessTemplate";
import { verticalNames } from "@/config/verticals";
import { formatDate } from "@/lib/format";

const trlOptions = Array.from({ length: 9 }, (_, i) => i + 1);

function computeDueDate(periodValue: number, periodUnit: "dias" | "meses"): string {
  const d = new Date();
  if (periodUnit === "dias") d.setDate(d.getDate() + periodValue);
  else d.setMonth(d.getMonth() + periodValue);
  return d.toISOString().slice(0, 10);
}

export function MicroStageManager() {
  const { data: projects } = useExecutingProjects();
  const { data: people } = usePeople();
  const pointsPerHour = useParamsStore((s) => s.pointsPerHour);

  const custom = useMicroStagesStore((s) => s.custom);
  const addMicroStage = useMicroStagesStore((s) => s.addMicroStage);
  const removeMicroStage = useMicroStagesStore((s) => s.removeMicroStage);
  const reassignMicroStage = useMicroStagesStore((s) => s.reassignMicroStage);
  const templateSteps = useTrlProcessTemplateStore((s) => s.steps);

  const activeProjects = useMemo(() => (projects ?? []).filter((p) => p.trl < 9), [projects]);
  const executors = useMemo(() => (people ?? []).filter((p) => p.profile === "executor"), [people]);

  const [projectId, setProjectId] = useState("");
  const [trlLevel, setTrlLevel] = useState<number | "">("");
  const [assigneeId, setAssigneeId] = useState("");
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  const selectedProject = activeProjects.find((p) => p.id === projectId);

  const stepList = useMemo(() => {
    if (!selectedProject || !trlLevel) return [];
    return templateSteps[templateKey(selectedProject.vertical, Number(trlLevel))] ?? [];
  }, [templateSteps, selectedProject, trlLevel]);

  // A lista de passos muda de identidade a cada troca de projeto/nível — os
  // checkboxes marcados de uma sequência anterior não fazem sentido na nova.
  useEffect(() => {
    setCheckedSteps(new Set());
  }, [selectedProject?.vertical, trlLevel]);

  function handleProjectChange(id: string) {
    setProjectId(id);
    const project = activeProjects.find((p) => p.id === id);
    setTrlLevel(project ? project.trl : "");
  }

  function toggleStep(stepId: string) {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !trlLevel || !assigneeId || checkedSteps.size === 0) return;

    const phaseId = `${projectId}-trl${trlLevel}`;
    const stepsToLink = stepList.filter((s) => checkedSteps.has(s.id));

    for (const step of stepsToLink) {
      addMicroStage({
        projectId,
        phaseId,
        trlLevel: Number(trlLevel),
        name: step.name,
        hours: step.hours,
        points: step.hours * pointsPerHour,
        assigneeId,
        dueDate: computeDueDate(step.periodValue, step.periodUnit),
      });
    }

    setAssigneeId("");
    setCheckedSteps(new Set());
  }

  const projectsById = useMemo(() => new Map((projects ?? []).map((p) => [p.id, p])), [projects]);
  const peopleById = useMemo(() => new Map((people ?? []).map((p) => [p.id, p])), [people]);

  const canSubmit = !!projectId && !!trlLevel && !!assigneeId && checkedSteps.size > 0;

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3.5 rounded-md border border-border bg-app-alt/40 p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-text-tertiary">Projeto</span>
          <select
            value={projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            required
            className="rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-text"
          >
            <option value="" className="bg-surface text-text">
              Selecione…
            </option>
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id} className="bg-surface text-text">
                {p.code} · {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-text-tertiary">Nível TRL</span>
          <select
            value={trlLevel}
            onChange={(e) => setTrlLevel(Number(e.target.value))}
            required
            className="rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-text"
          >
            <option value="" className="bg-surface text-text">
              —
            </option>
            {trlOptions.map((level) => (
              <option key={level} value={level} className="bg-surface text-text">
                TRL {level}
                {selectedProject && level === selectedProject.trl ? " (atual)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-text-tertiary">Responsável</span>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            required
            className="rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-text"
          >
            <option value="" className="bg-surface text-text">
              Selecione…
            </option>
            {executors.map((p) => (
              <option key={p.id} value={p.id} className="bg-surface text-text">
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {selectedProject && trlLevel && (
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-text-tertiary">
              <ListChecks className="h-3.5 w-3.5" />
              Sequência padrão — {verticalNames[selectedProject.vertical]} · TRL {trlLevel} — marque os passos a vincular
            </span>
            {stepList.length > 0 ? (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {stepList.map((step) => (
                  <label
                    key={step.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-[12.5px] transition-colors ${
                      checkedSteps.has(step.id) ? "border-primary bg-primary-soft/40 text-text" : "border-border bg-surface text-text-secondary"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedSteps.has(step.id)}
                      onChange={() => toggleStep(step.id)}
                      className="h-4 w-4 shrink-0 accent-primary"
                    />
                    <span className="min-w-0 flex-1 truncate">{step.name}</span>
                    <span className="shrink-0 font-mono text-[10.5px] text-text-tertiary">
                      {step.hours}h · {step.periodValue}{step.periodUnit === "dias" ? "d" : "m"}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-[11.5px] text-text-tertiary">
                Nenhuma sequência padrão cadastrada para esse nível/vertical ainda — defina em "Sequência de Processos" acima.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center justify-center gap-1.5 self-end rounded-md bg-primary px-3 py-2 text-[12.5px] font-bold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2 lg:col-span-1 lg:col-start-4"
        >
          <Link2 className="h-4 w-4" />
          Vincular {checkedSteps.size > 1 ? `(${checkedSteps.size})` : ""}
        </button>
      </form>

      <div className="flex flex-col divide-y divide-border">
        {custom.length === 0 && (
          <p className="py-6 text-center text-[12.5px] text-text-tertiary">
            Nenhuma micro-etapa vinculada ainda. Use o formulário acima — ela aparece na hora em Minhas Tarefas do
            responsável e em Análise Execução. Prazo e pontos vêm da sequência definida acima.
          </p>
        )}
        {custom
          .slice()
          .reverse()
          .map((m) => {
            const project = projectsById.get(m.projectId);
            return (
              <div key={m.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-text">{m.name}</p>
                  <p className="truncate text-[11px] text-text-tertiary">
                    {project ? `${project.code} · ${project.name}` : m.projectId} · TRL {project?.trl ?? "?"} · até {formatDate(m.dueDate)}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[11px] font-semibold text-text-secondary">
                  {m.hours}h · {m.points}pt
                </span>
                <label className="flex shrink-0 items-center gap-1.5" title="Transferir para outro responsável">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-text-tertiary" />
                  <select
                    value={m.assigneeId ?? ""}
                    onChange={(e) => reassignMicroStage(m.id, e.target.value)}
                    className="rounded-md border border-border bg-surface px-2 py-1.5 text-[11.5px] text-text"
                  >
                    {executors.map((p) => (
                      <option key={p.id} value={p.id} className="bg-surface text-text">
                        {peopleById.get(p.id)?.name ?? p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => removeMicroStage(m.id)}
                  aria-label="Remover vínculo"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
