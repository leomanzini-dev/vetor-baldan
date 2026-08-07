import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useTrlStore } from "@/store/trlStore";
import { pickThemed, trlBandColors, trlColor, trlTextColor } from "@/config/chartPalette";
import { bandForTrl, trlBands } from "@/config/trl";
import type { Project } from "@/types/domain";

const MIN_H = 46;
const MAX_H = 138;

function stepHeight(level: number): number {
  return MIN_H + ((level - 1) / 8) * (MAX_H - MIN_H);
}

export function TrlScaleLadder({ projects }: { projects: Project[] }) {
  const mode = useThemeStore((s) => s.mode);
  const levels = useTrlStore((s) => s.levels);
  const [selected, setSelected] = useState<number | null>(null);

  const counts = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of projects) map.set(p.trl, (map.get(p.trl) ?? 0) + 1);
    return map;
  }, [projects]);

  const total = projects.length || 1;
  const selectedLevel = levels.find((l) => l.level === selected) ?? null;
  const selectedCount = selected ? (counts.get(selected) ?? 0) : 0;
  const selectedBand = selectedLevel ? trlBands.find((b) => b.id === bandForTrl(selectedLevel.level)) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {trlBands.map((band, i) => (
          <div key={band.id} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: pickThemed(mode, { light: trlBandColors.light[i], dark: trlBandColors.dark[i] }) }}
            />
            <span className="text-[11px] font-medium text-text-tertiary">
              {band.label} · TRL {band.levels[0]}–{band.levels[1]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-1.5 overflow-x-auto pb-1 pt-5">
        {levels.map((level) => {
          const isSelected = selected === level.level;
          const count = counts.get(level.level) ?? 0;
          return (
            <button
              key={level.level}
              onClick={() => setSelected(isSelected ? null : level.level)}
              title={level.title}
              className="group relative flex min-w-[46px] flex-1 flex-col items-center justify-end gap-1 rounded-t-lg pb-2 pt-2 transition-transform hover:-translate-y-1"
              style={{
                height: stepHeight(level.level),
                backgroundColor: trlColor(level.level, mode),
                color: trlTextColor(level.level, mode),
                transform: isSelected ? "translateY(-6px)" : undefined,
                boxShadow: isSelected ? "0 0 0 2px var(--primary), var(--shadow-md)" : "var(--shadow-sm)",
              }}
            >
              {count > 0 && (
                <span className="absolute -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-border bg-surface px-1 font-mono text-[9px] font-bold text-text shadow-token-sm">
                  {count}
                </span>
              )}
              <span className="font-mono text-[14px] font-bold">{level.level}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-1.5">
        {levels.map((level) => (
          <span key={level.level} className="min-w-[46px] flex-1 truncate text-center text-[9.5px] text-text-tertiary">
            {level.title.split(" ")[0]}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedLevel ? (
          <motion.div
            key={selectedLevel.level}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="rounded-md border border-border bg-app-alt/50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold"
                  style={{ backgroundColor: trlColor(selectedLevel.level, mode), color: trlTextColor(selectedLevel.level, mode) }}
                >
                  {selectedLevel.level}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-text">{selectedLevel.title}</p>
                  <p className="text-[10.5px] text-text-tertiary">Faixa {selectedBand?.label}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                {selectedCount} projeto{selectedCount === 1 ? "" : "s"} · {Math.round((selectedCount / total) * 100)}%
              </span>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-text-secondary">{selectedLevel.description}</p>
            <div className="mt-2.5 rounded-md border border-border bg-surface px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Exige</p>
              <p className="mt-0.5 text-[12px] text-text-secondary">{selectedLevel.requirements}</p>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-center text-[12px] text-text-tertiary"
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            Clique num degrau para ver o que aquele nível significa, o que exige e quantos projetos do portfólio
            estão lá agora.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
