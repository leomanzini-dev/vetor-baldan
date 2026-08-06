import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { useTrlStore } from "@/store/trlStore";
import { pickThemed, trlColor } from "@/config/chartPalette";

interface Props {
  data: { level: number; count: number }[];
  onSelectLevel: (level: number) => void;
}

const SVG_W = 200;
const MAX_W = 200; // largura do topo — TRL 1
const MIN_W = 58; // largura da base — TRL 9
const FALLBACK_ROW_H = 52;

// Largura é função da POSIÇÃO na escala (1 = mais largo, 9 = mais fino),
// não da contagem de projetos — é a forma do funil de maturidade em si,
// a contagem real vira o número mostrado em cada linha da legenda.
function boundaryWidth(boundary: number, rows: number): number {
  return MAX_W - (boundary / rows) * (MAX_W - MIN_W);
}

export function MaturityFunnelChart({ data, onSelectLevel }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const trlLevels = useTrlStore((s) => s.levels);
  const [hovered, setHovered] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rows = data.length;

  // Mede a altura real da legenda (varia com fonte/zoom/tema) e faz o SVG do
  // funil bater exatamente com ela — em vez de chutar um valor fixo em px,
  // que ou sobra vazio embaixo ou corta os níveis mais fundos do funil.
  const [svgH, setSvgH] = useState(rows * FALLBACK_ROW_H);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => setSvgH(el.offsetHeight || rows * FALLBACK_ROW_H);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows]);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const rowH = svgH / rows;
  const surfaceStroke = pickThemed(mode, { light: "#FFFFFF", dark: "#1D1B15" });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg width={SVG_W} height={svgH} viewBox={`0 0 ${SVG_W} ${svgH}`} className="shrink-0">
        {data.map((d, i) => {
          const level = d.level;
          const yTop = i * rowH;
          const yBottom = yTop + rowH;
          const wTop = boundaryWidth(i, rows);
          const wBottom = boundaryWidth(i + 1, rows);
          const xTopL = (SVG_W - wTop) / 2;
          const xTopR = xTopL + wTop;
          const xBotL = (SVG_W - wBottom) / 2;
          const xBotR = xBotL + wBottom;
          const points = `${xTopL},${yTop} ${xTopR},${yTop} ${xBotR},${yBottom} ${xBotL},${yBottom}`;
          const isDim = hovered !== null && hovered !== level;

          return (
            <polygon
              key={level}
              points={points}
              fill={trlColor(level, mode)}
              fillOpacity={isDim ? 0.32 : 1}
              stroke={surfaceStroke}
              strokeWidth={2}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => setHovered(level)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectLevel(level)}
            />
          );
        })}
      </svg>

      <ul ref={listRef} className="flex w-full flex-1 flex-col divide-y divide-border">
        {data.map((d) => {
          const level = d.level;
          const def = trlLevels.find((l) => l.level === level);
          const share = total > 0 ? Math.round((d.count / total) * 100) : 0;
          const isActive = hovered === level;
          return (
            <li key={level}>
              <button
                onClick={() => onSelectLevel(level)}
                onMouseEnter={() => setHovered(level)}
                onMouseLeave={() => setHovered(null)}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors ${
                  isActive ? "bg-app-alt" : ""
                }`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: trlColor(level, mode) }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-text">
                    TRL {level} · {def?.title ?? ""}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-[14px] font-bold text-text">{d.count}</span>
                  <span className="block text-[9.5px] uppercase tracking-wide text-text-tertiary">{share}%</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
