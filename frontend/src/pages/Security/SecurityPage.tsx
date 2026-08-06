import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import "./brain.css";

const CENTER_RADIUS = 44;
const NODE_WIDTH = 70;
const NODE_HEIGHT = 70;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const REFRESH_MS = 8000;

const SECURITY_ICONS = [
  {
    id: "shield",
    label: "Escudo",
    icon: (
      <>
        <path d="M12 22s7-3.8 7-9.6V5.4L12 3 5 5.4v7C5 18.2 12 22 12 22z" />
        <path d="m9.5 12.2 1.7 1.7 3.5-4" />
      </>
    ),
  },
  {
    id: "lock",
    label: "Criptografia",
    icon: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v2" />
      </>
    ),
  },
  {
    id: "fingerprint",
    label: "Identidade",
    icon: (
      <>
        <path d="M12 11v5" />
        <path d="M16 11v1.5A4.5 4.5 0 0 1 11.5 17" />
        <path d="M8 11a4 4 0 0 1 8 0" />
        <path d="M5 11a7 7 0 0 1 11.6-5.3" />
        <path d="M19 11a7 7 0 0 0-1-3.6" />
      </>
    ),
  },
  {
    id: "radar",
    label: "Monitoramento",
    icon: (
      <>
        <path d="M12 20a8 8 0 1 0-8-8" />
        <path d="M12 16a4 4 0 1 0-4-4" />
        <path d="M12 12 18 6" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
  },
  {
    id: "key",
    label: "Chave",
    icon: (
      <>
        <circle cx="8" cy="15" r="3" />
        <path d="M10.2 12.8 20 3" />
        <path d="M15 8h3v3" />
      </>
    ),
  },
  {
    id: "eye",
    label: "Observação",
    icon: (
      <>
        <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
  },
];

/* ─── Tipos ─────────────────────────────────────────────────── */

interface BrainSource {
  source_key: string;
  actor: string;
  total: number;
  username: string | null;
  ip: string;
  label: string;
}

interface BrainEventRow {
  id: number;
  actor: string;
  source_key: string;
  ip: string;
  request_state: string;
  status_code: number;
  method: string;
  path: string;
  username: string | null;
  user_agent: string;
  duration_ms: number;
  raw_log: string;
  reason: string;
  created_at: string;
}

/* ─── Mock seed (PRNG determinístico) ───────────────────────── */

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MOCK_IPS = [
  "192.168.1.42", "10.0.0.15", "172.16.0.88", "203.0.113.12",
  "198.51.100.44", "45.33.32.156", "85.214.132.117", "91.108.4.22",
  "104.26.10.78", "162.158.79.12", "35.180.12.44", "52.58.78.16",
  "141.95.192.2", "178.62.1.88", "68.183.44.17",
];

const MOCK_USERNAMES = [
  "r.kappel", "m.baldan", "j.ferreira", "a.silva", "l.santos",
  "pmo.vetor", "admin.baldan",
];

const MOCK_PATHS = [
  "/api/projects", "/api/portfolio/summary", "/api/portfolio/highlights",
  "/api/verticals", "/api/execution/projects", "/api/people",
  "/api/parameters", "/api/projects/proj-ps-001", "/api/funnel-stages",
  "/api/execution/capacity", "/api/execution/proj-pl-012",
  "/api/project-types", "/api/health",
  "/.env", "/.git/config", "/wp-admin", "/admin/login",
  "/api/../../../etc/passwd", "/phpmyadmin",
];

const MOCK_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/17.5",
  "python-requests/2.32.3", "curl/8.7.1",
  "Go-http-client/2.0", "Nmap Scripting Engine",
  "sqlmap/1.8.4", "Nikto/2.5.0",
];

function generateMockData(seed: number) {
  const rand = mulberry32(seed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  const sourceCount = 6 + Math.floor(rand() * 8);
  const sources: BrainSource[] = [];
  const events: BrainEventRow[] = [];

  const now = Date.now();
  let eventId = 1;

  for (let i = 0; i < sourceCount; i++) {
    const r = rand();
    const actor = r < 0.4 ? "USER" : r < 0.75 ? "BOT" : "SSH_TRY";
    const ip = MOCK_IPS[i % MOCK_IPS.length];
    const username = actor === "USER" ? pick(MOCK_USERNAMES) : null;
    const source_key = actor === "USER" ? `USER:${username}` : `${actor}:${ip}`;
    const label = username ?? ip;
    const total = 2 + Math.floor(rand() * 28);

    sources.push({ source_key, actor, total, username, ip, label });

    for (let j = 0; j < Math.min(total, 6); j++) {
      const isSensitive = actor !== "USER" && rand() < 0.35;
      const path = isSensitive
        ? pick(MOCK_PATHS.slice(13))
        : pick(MOCK_PATHS.slice(0, 13));
      const method = actor === "SSH_TRY" ? "SSH" : (rand() < 0.85 ? "GET" : "POST");
      const status_code = actor === "USER" ? 200 : (isSensitive ? 403 : (rand() < 0.4 ? 404 : 200));
      const request_state = isSensitive ? "BLOCKED" : (actor === "SSH_TRY" ? "BLOCKED" : "OK");
      const duration_ms = Math.round(2 + rand() * 180);
      const created_at = new Date(now - Math.floor(rand() * 3600000)).toISOString();

      const dateStr = new Date(created_at).toLocaleDateString("pt-BR");
      const timeStr = new Date(created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const raw_log = `● ${actor} ${dateStr} --> ${timeStr} ---> ${ip} , REQUEST , ${status_code} , ${method} ${path} , user:${username ?? "unknown"} , ${duration_ms}ms`;

      events.push({
        id: eventId++,
        actor, source_key, ip, request_state, status_code, method, path,
        username, user_agent: pick(MOCK_USER_AGENTS),
        duration_ms, raw_log, reason: "", created_at,
      });
    }
  }

  events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const stats = {
    USER: sources.filter((s) => s.actor === "USER").reduce((sum, s) => sum + s.total, 0),
    BOT: sources.filter((s) => s.actor === "BOT").reduce((sum, s) => sum + s.total, 0),
    SSH_TRY: sources.filter((s) => s.actor === "SSH_TRY").reduce((sum, s) => sum + s.total, 0),
    total: sources.reduce((sum, s) => sum + s.total, 0),
  };

  return { sources, events, stats };
}

/* ─── Helpers visuais ───────────────────────────────────────── */

function formatTime(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function getTone(actor: string) {
  if (actor === "USER")
    return { color: "#22c55e", soft: "rgba(34, 197, 94, 0.2)", label: "OK" };
  if (actor === "SSH_TRY")
    return { color: "#a855f7", soft: "rgba(168, 85, 247, 0.22)", label: "SSH TRY" };
  return { color: "#ff2f4f", soft: "rgba(255, 47, 79, 0.22)", label: "NEGADO" };
}

/* ─── BrainGraph ────────────────────────────────────────────── */

function BrainGraph({
  sources, pulse, onSelect,
}: {
  sources: BrainSource[];
  pulse: boolean;
  onSelect: (source: BrainSource) => void;
}) {
  const wrapRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ w: 1100, h: 560 });

  useEffect(() => {
    const update = () => {
      const el = wrapRef.current;
      if (!el) return;
      setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const cx = size.w / 2;
  const cy = size.h / 2;

  const positioned = useMemo(() => {
    const total = sources.length;
    if (!total) return [];
    const marginX = 86;
    const marginY = 92;
    const maxRx = Math.max(230, size.w / 2 - marginX);
    const maxRy = Math.max(190, size.h / 2 - marginY);
    return sources.map((source, index) => {
      const angle = index * GOLDEN_ANGLE - Math.PI / 2;
      const t = total === 1 ? 0.66 : 0.52 + Math.sqrt((index + 0.5) / total) * 0.48;
      const x = Math.max(marginX, Math.min(size.w - marginX, cx + Math.cos(angle) * maxRx * t));
      const y = Math.max(marginY, Math.min(size.h - marginY, cy + Math.sin(angle) * maxRy * t));
      return { source, x, y };
    });
  }, [sources, size, cx, cy]);

  return (
    <section className={`brain-graph ${pulse ? "is-pulsing" : ""}`} ref={wrapRef}>
      <svg className="brain-graph__lines" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
        {positioned.map(({ source, x, y }, index) => {
          const tone = getTone(source.actor);
          const dx = x - cx;
          const dy = y - cy;
          const d = `M ${x} ${y} C ${x - dx * 0.24} ${y - dy * 0.24}, ${cx + dx * 0.24} ${cy + dy * 0.24}, ${cx} ${cy}`;
          const duration = source.actor === "USER" ? 2.8 : 1.7;
          return (
            <g key={source.source_key} className={`brain-graph__flow brain-graph__flow--${source.actor.toLowerCase()}`}>
              <path
                d={d} fill="none" stroke={tone.color}
                strokeOpacity={source.actor === "USER" ? 0.28 : 0.42}
                strokeWidth={source.actor === "USER" ? 1.4 : 1.8}
              />
              <circle r={source.actor === "USER" ? 3 : 3.6} fill={tone.color} fillOpacity="0.88">
                <animateMotion
                  dur={`${duration}s`}
                  begin={`${-(index % 5) * 0.28}s`}
                  repeatCount="indefinite"
                  path={d}
                />
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="brain-orbit brain-orbit--outer" style={{ left: cx - 128, top: cy - 128 }} />
      <div className="brain-orbit brain-orbit--inner" style={{ left: cx - 94, top: cy - 94 }} />

      {SECURITY_ICONS.map((item, index) => {
        const angle = (index / SECURITY_ICONS.length) * Math.PI * 2 - Math.PI / 2;
        const orbit = 116;
        return (
          <span
            className="brain-security-icon"
            key={item.id}
            title={item.label}
            style={{
              left: cx + Math.cos(angle) * orbit - 18,
              top: cy + Math.sin(angle) * orbit - 18,
              "--icon-delay": `${index * 0.18}s`,
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
          </span>
        );
      })}

      <div className="brain-core" style={{ left: cx - CENTER_RADIUS, top: cy - CENTER_RADIUS }}>
        <ShieldCheck size={28} />
        <strong>VETOR</strong>
      </div>

      {positioned.map(({ source, x, y }) => {
        const tone = getTone(source.actor);
        return (
          <button
            type="button"
            className={`brain-node brain-node--${source.actor.toLowerCase()}`}
            key={source.source_key}
            style={{
              left: x - NODE_WIDTH / 2,
              top: y - NODE_HEIGHT / 2,
              "--brain-node-color": tone.color,
              "--brain-node-soft": tone.soft,
            } as React.CSSProperties}
            onClick={() => onSelect(source)}
            title={`${source.ip || "unknown"} · ${source.label}`}
          >
            <span>{tone.label}</span>
            <small>{source.ip || "unknown"}</small>
          </button>
        );
      })}
    </section>
  );
}

/* ─── BrainModal ────────────────────────────────────────────── */

function BrainModal({
  source, allEvents, onClose,
}: {
  source: BrainSource;
  allEvents: BrainEventRow[];
  onClose: () => void;
}) {
  const events = useMemo(
    () => allEvents.filter((e) => e.source_key === source.source_key).slice(0, 30),
    [allEvents, source.source_key],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tone = getTone(source.actor);

  return (
    <div className="brain-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section
        className="brain-modal__panel"
        style={{ "--brain-modal-color": tone.color } as React.CSSProperties}
      >
        <header className="brain-modal__head">
          <div>
            <span className={`brain-pill brain-pill--${source.actor.toLowerCase()}`}>
              {source.actor.replace("_", " ")}
            </span>
            <h2>{source.label}</h2>
            <p>
              {source.total} evento{source.total === 1 ? "" : "s"} · IP {source.ip || "unknown"}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">✕</button>
        </header>

        <div className="brain-modal__list">
          {events.map((event) => (
            <article className={`brain-log brain-log--${event.actor.toLowerCase()}`} key={event.id}>
              <div className="brain-log__meta">
                <span>{event.request_state}</span>
                <span>{event.status_code}</span>
                <span>{event.duration_ms}ms</span>
                <time>{formatTime(event.created_at)}</time>
              </div>
              <strong>{event.method} {event.path}</strong>
              <p>{event.raw_log}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── SecurityPage (overlay fullscreen) ─────────────────────── */

export function SecurityPage({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState(() => generateMockData(20240914));
  const [selected, setSelected] = useState<BrainSource | null>(null);
  const [pulse, setPulse] = useState(false);
  const tickRef = useRef(0);

  const refresh = useCallback(() => {
    tickRef.current += 1;
    const next = generateMockData(20240914 + tickRef.current * 7);
    setData(next);
    setPulse(true);
    setTimeout(() => setPulse(false), 480);
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const recent = useMemo(() => data.events.slice(0, 10), [data.events]);
  const lastUpdate = useMemo(() => new Date().toLocaleTimeString("pt-BR"), [data]);

  const clearEvents = () => {
    if (!window.confirm("Apagar todos os logs do Guard?")) return;
    setData({ sources: [], events: [], stats: { USER: 0, BOT: 0, SSH_TRY: 0, total: 0 } });
    tickRef.current = 0;
  };

  return (
    <main className="brain-page">
      <header className="brain-topbar">
        <div className="brain-brand">
          <div className="brain-brand__mark">
            <ShieldCheck size={28} />
          </div>
          <div>
            <span>VETOR</span>
            <h1>Guard</h1>
          </div>
        </div>

        <div className="brain-stats">
          <div className="brain-stat brain-stat--user">
            <span>USER</span>
            <strong>{data.stats.USER || 0}</strong>
          </div>
          <div className="brain-stat brain-stat--bot">
            <span>BOT</span>
            <strong>{data.stats.BOT || 0}</strong>
          </div>
          <div className="brain-stat brain-stat--ssh">
            <span>SSH</span>
            <strong>{data.stats.SSH_TRY || 0}</strong>
          </div>
          <div className="brain-stat">
            <span>TOTAL</span>
            <strong>{data.stats.total || 0}</strong>
          </div>
        </div>

        <div className="brain-actions">
          <span className="brain-status brain-status--ok">
            <i />
            Online
          </span>
          <time>{lastUpdate}</time>
          <button type="button" onClick={refresh}>Atualizar</button>
          <button type="button" className="is-danger" onClick={clearEvents}>Limpar</button>
          <button type="button" onClick={onClose}>Fechar</button>
        </div>
      </header>

      <section className="brain-layout">
        <BrainGraph sources={data.sources} pulse={pulse} onSelect={setSelected} />

        <aside className="brain-feed">
          <div className="brain-feed__head">
            <span>Log em tempo real</span>
            <strong>{recent.length}</strong>
          </div>

          <div className="brain-feed__list">
            {recent.map((event) => (
              <article className={`brain-log brain-log--${event.actor.toLowerCase()}`} key={event.id}>
                <div className="brain-log__meta">
                  <span>{event.actor.replace("_", " ")}</span>
                  <span>{event.status_code}</span>
                  <span>{event.duration_ms}ms</span>
                </div>
                <strong>{event.method} {event.path}</strong>
                <p>{event.raw_log}</p>
              </article>
            ))}

            {!recent.length && (
              <div className="brain-empty">
                <strong>Aguardando eventos</strong>
                <span>As próximas requisições aparecerão aqui.</span>
              </div>
            )}
          </div>
        </aside>
      </section>

      {selected && (
        <BrainModal source={selected} allEvents={data.events} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
