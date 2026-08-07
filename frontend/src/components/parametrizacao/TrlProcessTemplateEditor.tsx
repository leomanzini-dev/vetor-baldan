import { useState } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useTrlProcessTemplateStore } from "@/store/trlProcessTemplateStore";
import { templateKey, type PeriodUnit } from "@/config/trlProcessTemplate";
import { verticalOrder, verticalNames } from "@/config/verticals";
import { verticalChartColors, trlColor, trlTextColor, pickThemed } from "@/config/chartPalette";
import type { VerticalId } from "@/types/domain";

const trlLevels = Array.from({ length: 9 }, (_, i) => i + 1);

export function TrlProcessTemplateEditor() {
  const mode = useThemeStore((s) => s.mode);
  const steps = useTrlProcessTemplateStore((s) => s.steps);
  const addStep = useTrlProcessTemplateStore((s) => s.addStep);
  const removeStep = useTrlProcessTemplateStore((s) => s.removeStep);
  const reset = useTrlProcessTemplateStore((s) => s.reset);

  const [vertical, setVertical] = useState<VerticalId>("preparo-solo");
  const [level, setLevel] = useState(1);
  const [draft, setDraft] = useState("");
  const [draftHours, setDraftHours] = useState(8);
  const [draftPeriodValue, setDraftPeriodValue] = useState(5);
  const [draftPeriodUnit, setDraftPeriodUnit] = useState<PeriodUnit>("dias");

  const key = templateKey(vertical, level);
  const list = steps[key] ?? [];

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || draftHours <= 0 || draftPeriodValue <= 0) return;
    addStep(vertical, level, draft.trim(), draftHours, draftPeriodValue, draftPeriodUnit);
    setDraft("");
    setDraftHours(8);
    setDraftPeriodValue(5);
    setDraftPeriodUnit("dias");
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] text-text-tertiary">
          Sequência padrão de processos por nível TRL e vertical — usada como checklist ao criar micro-etapas.
        </p>
        <button onClick={reset} className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-text-tertiary hover:text-primary">
          <RotateCcw className="h-3 w-3" />
          Restaurar tudo
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {verticalOrder.map((v) => {
          const active = v === vertical;
          const color = pickThemed(mode, verticalChartColors[v]);
          return (
            <button
              key={v}
              onClick={() => setVertical(v)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                active ? "border-transparent text-white" : "border-border bg-surface text-text-secondary hover:border-primary/40"
              }`}
              style={active ? { backgroundColor: color } : undefined}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: active ? "#fff" : color }} />
              {verticalNames[v]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {trlLevels.map((l) => {
          const active = l === level;
          return (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                active ? "" : "border border-border bg-surface text-text-secondary hover:border-primary/40"
              }`}
              style={active ? { backgroundColor: trlColor(l, mode), color: trlTextColor(l, mode) } : undefined}
            >
              {l}
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-border bg-app-alt/40 p-3.5">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-text-tertiary">
          {verticalNames[vertical]} · TRL {level}
        </p>
        <div className="flex flex-col gap-1.5">
          {list.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-alt font-mono text-[10px] font-bold text-text-tertiary">
                {i + 1}
              </span>
              <p className="min-w-0 flex-1 text-[12.5px] text-text">{step.name}</p>
              <span className="shrink-0 font-mono text-[11px] font-semibold text-text-secondary">
                {step.hours}h · {step.periodValue} {step.periodUnit}
              </span>
              <button
                onClick={() => removeStep(vertical, level, step.id)}
                aria-label="Remover passo"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {list.length === 0 && <p className="py-3 text-center text-[12px] text-text-tertiary">Nenhum passo definido — adicione abaixo.</p>}
        </div>

        <form onSubmit={handleAdd} className="mt-2.5 flex flex-wrap items-end gap-2">
          <label className="flex min-w-[180px] flex-1 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Novo passo</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nome do passo do processo..."
              className="rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-text"
            />
          </label>
          <label className="flex w-20 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Horas</span>
            <input
              type="number"
              min={1}
              max={200}
              value={draftHours}
              onChange={(e) => setDraftHours(Number(e.target.value))}
              className="rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-text"
            />
          </label>
          <label className="flex w-24 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Prazo</span>
            <input
              type="number"
              min={1}
              max={365}
              value={draftPeriodValue}
              onChange={(e) => setDraftPeriodValue(Number(e.target.value))}
              className="rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-text"
            />
          </label>
          <label className="flex w-28 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Unidade</span>
            <select
              value={draftPeriodUnit}
              onChange={(e) => setDraftPeriodUnit(e.target.value as PeriodUnit)}
              className="rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-text"
            >
              <option value="dias" className="bg-surface text-text">
                Dias
              </option>
              <option value="meses" className="bg-surface text-text">
                Meses
              </option>
            </select>
          </label>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-bold text-on-primary transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
