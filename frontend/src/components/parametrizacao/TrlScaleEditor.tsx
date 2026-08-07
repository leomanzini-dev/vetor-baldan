import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useTrlStore } from "@/store/trlStore";
import { useProjects } from "@/hooks/usePortfolio";
import { trlColor, trlTextColor } from "@/config/chartPalette";
import { bandForTrl, trlBands } from "@/config/trl";
import type { TrlLevelDef } from "@/config/trl";

function LevelCard({ level, count }: { level: TrlLevelDef; count: number }) {
  const mode = useThemeStore((s) => s.mode);
  const updateLevel = useTrlStore((s) => s.updateLevel);
  const band = trlBands.find((b) => b.id === bandForTrl(level.level));

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-app-alt/40 p-4">
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold"
          style={{ backgroundColor: trlColor(level.level, mode), color: trlTextColor(level.level, mode) }}
        >
          {level.level}
        </span>
        <div className="min-w-0 flex-1">
          <input
            value={level.title}
            onChange={(e) => updateLevel(level.level, { title: e.target.value })}
            className="w-full rounded-md border border-transparent bg-transparent px-1 -mx-1 text-[14px] font-semibold text-text outline-none transition-colors hover:border-border focus:border-primary focus:bg-surface focus:px-2 focus:-mx-2"
          />
          <p className="mt-0.5 text-[10.5px] text-text-tertiary">Faixa {band?.label}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-surface px-2 py-1 text-[10.5px] font-semibold text-text-secondary">
          {count} projeto{count === 1 ? "" : "s"}
        </span>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          O que significa
        </label>
        <textarea
          value={level.description}
          onChange={(e) => updateLevel(level.level, { description: e.target.value })}
          rows={2}
          className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12.5px] text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          O que exige para avançar
        </label>
        <textarea
          value={level.requirements}
          onChange={(e) => updateLevel(level.level, { requirements: e.target.value })}
          rows={2}
          className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12.5px] text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
        />
      </div>
    </div>
  );
}

export function TrlScaleEditor() {
  const levels = useTrlStore((s) => s.levels);
  const reset = useTrlStore((s) => s.reset);
  const { data } = useProjects({ limit: 200 });

  const counts = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of data?.items ?? []) map.set(p.trl, (map.get(p.trl) ?? 0) + 1);
    return map;
  }, [data]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-text-tertiary">
          Edite título, significado e exigências de cada nível — o resto da plataforma reflete a mudança na hora.
        </p>
        <button
          onClick={reset}
          className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-text-tertiary hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" />
          Restaurar padrão
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {levels.map((level) => (
          <LevelCard key={level.level} level={level} count={counts.get(level.level) ?? 0} />
        ))}
      </div>
    </div>
  );
}
