import { useState } from "react";
import { ChevronDown, Pencil, Check, X, RotateCcw } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useTrlStore } from "@/store/trlStore";
import { trlColor } from "@/config/chartPalette";
import type { TrlLevelDef } from "@/config/trl";

function LevelRow({ level }: { level: TrlLevelDef }) {
  const mode = useThemeStore((s) => s.mode);
  const updateLevel = useTrlStore((s) => s.updateLevel);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(level);

  function startEdit() {
    setDraft(level);
    setEditing(true);
    setOpen(true);
  }

  function save() {
    updateLevel(level.level, { title: draft.title, description: draft.description, requirements: draft.requirements });
    setEditing(false);
  }

  return (
    <div className="rounded-md border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold text-white"
          style={{ backgroundColor: trlColor(level.level, mode) }}
        >
          {level.level}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text">{level.title}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-border px-3.5 py-3.5">
          {editing ? (
            <div className="flex flex-col gap-2.5">
              <div>
                <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">
                  Título
                </label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full rounded-md border border-border bg-app-alt px-2.5 py-1.5 text-[12.5px] text-text outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">
                  O que significa
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-md border border-border bg-app-alt px-2.5 py-1.5 text-[12.5px] text-text outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">
                  O que exige
                </label>
                <textarea
                  value={draft.requirements}
                  onChange={(e) => setDraft({ ...draft, requirements: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-md border border-border bg-app-alt px-2.5 py-1.5 text-[12.5px] text-text outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={save}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-on-primary hover:bg-primary-hover"
                >
                  <Check className="h-3.5 w-3.5" />
                  Salvar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-semibold text-text-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p className="text-[12.5px] leading-relaxed text-text-secondary">{level.description}</p>
              <div className="rounded-md bg-app-alt px-3 py-2">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">Exige</p>
                <p className="mt-0.5 text-[12px] text-text-secondary">{level.requirements}</p>
              </div>
              <button
                onClick={startEdit}
                className="flex w-fit items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:text-primary-hover"
              >
                <Pencil className="h-3 w-3" />
                Editar definição
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TrlScalePanel() {
  const levels = useTrlStore((s) => s.levels);
  const reset = useTrlStore((s) => s.reset);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-text-tertiary">
          Clique num nível para ver ou editar o que ele significa e o que exige.
        </p>
        <button
          onClick={reset}
          className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-text-tertiary hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" />
          Restaurar
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {levels.map((level) => (
          <LevelRow key={level.level} level={level} />
        ))}
      </div>
    </div>
  );
}
