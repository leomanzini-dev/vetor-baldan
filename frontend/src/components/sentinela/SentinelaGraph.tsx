import { useEffect, useMemo, useRef, useState } from "react";
import { SENTINELA_ICONS } from "@/config/sentinela";
import type { SentinelaEvent } from "@/config/sentinela";
import baldanLogo from "@/assets/baldan-logo.png";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const CENTER_RADIUS = 48;
const NODE_SIZE = 74;

export interface SentinelaSource {
  personaId: string;
  personaName: string;
  actor: "autorizado" | "bloqueado";
  total: number;
  lastTimestamp: string;
}

function toneFor(actor: "autorizado" | "bloqueado") {
  return actor === "autorizado"
    ? { color: "var(--success)", soft: "var(--success-soft)", label: "OK" }
    : { color: "var(--danger)", soft: "var(--danger-soft)", label: "BLOQ" };
}

export function buildSources(events: SentinelaEvent[]): SentinelaSource[] {
  const byPersona = new Map<string, SentinelaEvent[]>();
  for (const ev of events) {
    const list = byPersona.get(ev.personaId) ?? [];
    list.push(ev);
    byPersona.set(ev.personaId, list);
  }
  const sources: SentinelaSource[] = [];
  byPersona.forEach((list, personaId) => {
    const sorted = [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latest = sorted[0];
    sources.push({
      personaId,
      personaName: latest.personaName,
      actor: latest.actor,
      total: list.length,
      lastTimestamp: latest.timestamp,
    });
  });
  return sources.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
}

export function SentinelaGraph({
  sources,
  pulse,
  onSelect,
}: {
  sources: SentinelaSource[];
  pulse: boolean;
  onSelect: (personaId: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 520 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = size.w / 2;
  const cy = size.h / 2;

  const positioned = useMemo(() => {
    const total = sources.length;
    if (!total) return [];
    const marginX = 70;
    const marginY = 78;
    const maxRx = Math.max(190, size.w / 2 - marginX);
    const maxRy = Math.max(150, size.h / 2 - marginY);
    return sources.map((source, index) => {
      const angle = index * GOLDEN_ANGLE - Math.PI / 2;
      const t = total === 1 ? 0.62 : 0.5 + Math.sqrt((index + 0.5) / total) * 0.5;
      const x = Math.max(marginX, Math.min(size.w - marginX, cx + Math.cos(angle) * maxRx * t));
      const y = Math.max(marginY, Math.min(size.h - marginY, cy + Math.sin(angle) * maxRy * t));
      return { source, x, y };
    });
  }, [sources, size, cx, cy]);

  return (
    <section ref={wrapRef} className="relative h-full min-h-[380px] w-full overflow-hidden">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {positioned.map(({ source, x, y }, index) => {
          const tone = toneFor(source.actor);
          const dx = x - cx;
          const dy = y - cy;
          const d = `M ${x} ${y} C ${x - dx * 0.24} ${y - dy * 0.24}, ${cx + dx * 0.24} ${cy + dy * 0.24}, ${cx} ${cy}`;
          const duration = source.actor === "autorizado" ? 2.6 : 1.5;
          return (
            <g key={source.personaId}>
              <path
                d={d}
                fill="none"
                stroke={tone.color}
                strokeOpacity={source.actor === "autorizado" ? 0.22 : 0.4}
                strokeWidth={source.actor === "autorizado" ? 1.2 : 1.8}
              />
              <circle r={source.actor === "autorizado" ? 2.6 : 3.2} fill={tone.color} fillOpacity={0.9}>
                <animateMotion dur={`${duration}s`} begin={`${-(index % 5) * 0.3}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* anéis orbitais */}
      <div
        className="absolute rounded-full border border-white/10"
        style={{ left: cx - 140, top: cy - 140, width: 280, height: 280, animation: "sentinela-orbit-rotate 24s linear infinite" }}
      />
      <div
        className="absolute rounded-full border border-primary/25 border-dashed"
        style={{ left: cx - 100, top: cy - 100, width: 200, height: 200, animation: "sentinela-orbit-rotate 17s linear infinite reverse" }}
      />

      {/* ícones de segurança orbitando */}
      {SENTINELA_ICONS.map((item, index) => {
        const angle = (index / SENTINELA_ICONS.length) * Math.PI * 2 - Math.PI / 2;
        const orbit = 120;
        const Icon = item.Icon;
        return (
          <span
            key={item.id}
            title={item.label}
            className="absolute flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-primary backdrop-blur-sm"
            style={{
              left: cx + Math.cos(angle) * orbit - 18,
              top: cy + Math.sin(angle) * orbit - 18,
              animation: "sentinela-icon-float 3.6s ease-in-out infinite",
              animationDelay: `${index * 0.18}s`,
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
        );
      })}

      {/* núcleo — marca Baldan/VETOR */}
      <div
        className="absolute flex flex-col items-center justify-center gap-1 rounded-full border border-primary/40 bg-nav-soft text-center shadow-[0_0_40px_rgba(203,10,38,0.35)]"
        style={{ left: cx - CENTER_RADIUS, top: cy - CENTER_RADIUS, width: CENTER_RADIUS * 2, height: CENTER_RADIUS * 2 }}
      >
        <div
          className="pointer-events-none absolute -inset-6 rounded-full border border-primary/30"
          style={{ animation: "sentinela-ring 3.8s ease-in-out infinite" }}
        />
        <img src={baldanLogo} alt="Baldan" className="h-3 w-auto" />
        <strong className="text-[9px] font-bold tracking-[2px] text-nav-text">SENTINELA</strong>
      </div>

      {/* nós — pessoas com atividade registrada */}
      {positioned.map(({ source, x, y }) => {
        const tone = toneFor(source.actor);
        return (
          <button
            key={source.personaId}
            type="button"
            onClick={() => onSelect(source.personaId)}
            title={`${source.personaName} · ${source.total} evento${source.total === 1 ? "" : "s"}`}
            className="absolute flex flex-col items-center justify-center gap-0.5 rounded-2xl border text-center transition-transform hover:z-10 hover:scale-110"
            style={{
              left: x - NODE_SIZE / 2,
              top: y - NODE_SIZE / 2,
              width: NODE_SIZE,
              height: NODE_SIZE,
              borderColor: tone.color,
              backgroundColor: tone.soft,
              boxShadow: pulse ? `0 0 0 4px ${tone.soft}` : undefined,
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{ border: `1px solid ${tone.color}`, animation: "sentinela-node-pulse 2.8s ease-in-out infinite" }}
            />
            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: tone.color }}>
              {tone.label}
            </span>
            <span className="max-w-[60px] truncate text-[10px] font-semibold text-nav-text">
              {source.personaName.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </section>
  );
}
