import { useEffect, useMemo, useRef, useState } from "react";
import { X, RotateCcw, ShieldCheck } from "lucide-react";
import { useSentinelaStore } from "@/store/sentinelaStore";
import { profileLabels } from "@/config/profiles";
import { SentinelaGraph, buildSources } from "@/components/sentinela/SentinelaGraph";
import type { PersonProfile } from "@/types/domain";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function SentinelaPanel() {
  const isOpen = useSentinelaStore((s) => s.isOpen);
  const close = useSentinelaStore((s) => s.close);
  const events = useSentinelaStore((s) => s.events);
  const clearEvents = useSentinelaStore((s) => s.clearEvents);

  const [selected, setSelected] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const lastTopId = useRef<string>("");

  useEffect(() => {
    if (!isOpen) return;
    const topId = events[0]?.id ?? "";
    if (lastTopId.current && topId !== lastTopId.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 480);
      return () => clearTimeout(t);
    }
    lastTopId.current = topId;
  }, [events, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (selected) setSelected(null);
        else close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, selected, close]);

  const sources = useMemo(() => buildSources(events), [events]);
  const recent = events.slice(0, 12);
  const autorizados = events.filter((e) => e.actor === "autorizado").length;
  const bloqueados = events.filter((e) => e.actor === "bloqueado").length;

  const selectedEvents = selected ? events.filter((e) => e.personaId === selected) : [];
  const selectedSource = sources.find((s) => s.personaId === selected);

  if (!isOpen) return null;

  return (
    <div data-theme="dark" className="fixed inset-0 z-[100] flex flex-col bg-nav text-nav-text">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-4 border-b border-nav-border px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-none text-nav-text">Sentinela</p>
            <p className="mt-1 text-[11px] text-nav-text-muted">Auditoria de acessos · VETOR</p>
          </div>
        </div>

        <div className="ml-0 flex items-center gap-3 sm:ml-4">
          <div className="rounded-lg border border-nav-border bg-white/5 px-3 py-1.5 text-center">
            <p className="font-mono text-[15px] font-bold text-success">{autorizados}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide text-nav-text-muted">Autorizados</p>
          </div>
          <div className="rounded-lg border border-nav-border bg-white/5 px-3 py-1.5 text-center">
            <p className="font-mono text-[15px] font-bold text-danger">{bloqueados}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide text-nav-text-muted">Bloqueados</p>
          </div>
          <div className="rounded-lg border border-nav-border bg-white/5 px-3 py-1.5 text-center">
            <p className="font-mono text-[15px] font-bold text-nav-text">{events.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide text-nav-text-muted">Total</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Monitoramento ativo
          </span>
          <button
            onClick={() => {
              if (window.confirm("Limpar o histórico de auditoria do Sentinela?")) clearEvents();
            }}
            className="flex items-center gap-1.5 rounded-md border border-nav-border px-3 py-1.5 text-[12px] font-semibold text-nav-text-muted transition-colors hover:border-danger/40 hover:text-danger"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar
          </button>
          <button
            onClick={close}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-nav-border text-nav-text-muted transition-colors hover:border-white/30 hover:text-nav-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Corpo */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <SentinelaGraph sources={sources} pulse={pulse} onSelect={setSelected} />

        <aside className="flex w-full shrink-0 flex-col border-t border-nav-border bg-white/[0.03] lg:w-[340px] lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-nav-border px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-nav-text-muted">Log em tempo real</span>
            <strong className="font-mono text-[12px] text-nav-text">{recent.length}</strong>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {recent.map((event) => (
              <article
                key={event.id}
                className={`mb-2 rounded-lg border px-3 py-2.5 ${
                  event.actor === "autorizado" ? "border-success/25 bg-success-soft/40" : "border-danger/25 bg-danger-soft/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wide">
                  <span className={event.actor === "autorizado" ? "text-success" : "text-danger"}>
                    {event.actor === "autorizado" ? "Autorizado" : "Bloqueado"}
                  </span>
                  <time className="font-mono font-normal normal-case text-nav-text-muted">{formatTime(event.timestamp)}</time>
                </div>
                <p className="mt-1 text-[12.5px] font-semibold text-nav-text">
                  {event.personaName} <span className="font-normal text-nav-text-muted">→ {event.screenLabel}</span>
                </p>
                <p className="mt-0.5 truncate text-[11px] text-nav-text-muted">{event.reason}</p>
              </article>
            ))}
            {recent.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
                <ShieldCheck className="h-6 w-6 text-nav-text-muted" />
                <p className="text-[12px] text-nav-text-muted">Aguardando eventos de navegação.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal de detalhe da persona */}
      {selected && selectedSource && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <section className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-card border border-nav-border bg-nav-soft">
            <header className="flex items-start justify-between gap-3 border-b border-nav-border px-5 py-4">
              <div>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    selectedSource.actor === "autorizado" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                  }`}
                >
                  {selectedSource.actor}
                </span>
                <h2 className="mt-1.5 text-[16px] font-bold text-nav-text">{selectedSource.personaName}</h2>
                <p className="text-[12px] text-nav-text-muted">
                  {profileLabels[(selectedEvents[0]?.profile as PersonProfile) ?? "executor"]} · {selectedSource.total} evento
                  {selectedSource.total === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Fechar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-nav-border text-nav-text-muted hover:text-nav-text"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[55vh] overflow-y-auto px-5 py-3">
              {selectedEvents.map((event) => (
                <div key={event.id} className="border-b border-nav-border py-2.5 last:border-0">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide">
                    <span className={event.actor === "autorizado" ? "text-success" : "text-danger"}>{event.actor}</span>
                    <time className="font-mono font-normal normal-case text-nav-text-muted">{formatTime(event.timestamp)}</time>
                  </div>
                  <p className="mt-1 text-[12.5px] font-semibold text-nav-text">{event.screenLabel}</p>
                  <p className="mt-0.5 text-[11px] text-nav-text-muted">{event.reason}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
