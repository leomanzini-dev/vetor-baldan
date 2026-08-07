import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Bot, Loader2, RotateCcw, Sparkles, Brain } from "lucide-react";
import type { PersonPaceStatus } from "@/lib/executionPace";
import type { Project } from "@/types/domain";

interface PersonMetrics {
  name: string;
  role: string;
  avatarInitials: string;
  status: PersonPaceStatus;
  monthlyCapacityPoints: number;
  pointsCommittedOverall: number;
  pointsEarnedOverall: number;
  pointsEarnedProject: number;
  pointsExpectedProject: number;
}

interface Props {
  person: PersonMetrics;
  project: Project;
  onClose: () => void;
}

interface Result {
  answer: string;
  summaries?: string[];
  intent?: string;
}

function buildQuestion(person: PersonMetrics, project: Project): string {
  const utilizationPct = person.monthlyCapacityPoints > 0 ? Math.round((person.pointsCommittedOverall / person.monthlyCapacityPoints) * 100) : 0;
  return (
    `[Contexto: Execução › Alocação por Projeto] Analise a alocação de ${person.name} (${person.role}) ` +
    `no projeto ${project.code} · ${project.name}, atualmente em TRL ${project.trl}. ` +
    `Dados do mês: capacidade mensal ${person.monthlyCapacityPoints} pts; comprometido no total (somando todos os projetos dela) ${person.pointsCommittedOverall} pts ` +
    `(${utilizationPct}% da capacidade); entregue no total ${person.pointsEarnedOverall} pts. ` +
    `Só neste projeto: ${person.pointsEarnedProject} pts entregues de ${person.pointsExpectedProject} pts que já deveriam ter sido entregues até hoje pelas datas das micro-etapas. ` +
    `Resuma a situação em poucas frases, diga se há indício de sobrecarga (mais trabalho comprometido do que cabe na capacidade) ou de baixa produtividade ` +
    `(sobra capacidade mas a entrega está abaixo do esperado), e recomende uma ação concreta: alocar mais uma pessoa nesse projeto, redistribuir micro-etapas ` +
    `para outros projetos dela, ou apenas acompanhar de perto.`
  );
}

export function PersonAllocationModal({ person, project, onClose }: Props) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [result, setResult] = useState<Result | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const fetchedRef = useRef(false);

  async function generate() {
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: buildQuestion(person, project), history: [] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult({ answer: data.answer, summaries: data.summaries, intent: data.intent });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ai-chat-glow flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-app" style={{ maxHeight: "min(600px, calc(100vh - 80px))" }}>
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nav text-[13px] font-bold text-nav-text">
            {person.avatarInitials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-semibold text-text">{person.name}</h2>
            <p className="truncate text-[11.5px] text-text-tertiary">
              {project.code} · {project.name}
            </p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:text-text">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-2.5 rounded-lg border border-border bg-app-alt/60 px-4 py-8">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-[13px] text-text-tertiary">A IA está analisando a alocação...</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-app-alt/60 px-4 py-4">
              <p className="text-[12.5px] leading-relaxed text-text-tertiary">
                Não foi possível gerar a análise agora — o backend de IA pode estar indisponível (por exemplo, numa versão publicada sem servidor).
              </p>
              <button onClick={generate} className="flex w-fit items-center gap-1.5 text-[12px] font-semibold text-primary">
                <RotateCcw className="h-3 w-3" /> Tentar de novo
              </button>
            </div>
          )}

          {status === "done" && result && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-app-alt/60 px-3.5 py-3 text-[13px] leading-relaxed text-text-secondary">
                <p className="whitespace-pre-wrap">{result.answer}</p>
                {result.summaries && result.summaries.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowThinking((v) => !v)}
                      className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-text-tertiary transition-colors hover:text-primary"
                    >
                      <Brain className="h-3 w-3" />
                      {showThinking ? "Fechar" : "Como a IA pensou"}
                    </button>
                    {showThinking && (
                      <div className="mt-2 rounded-lg border border-primary/20 bg-primary-soft/30 px-3 py-2.5 text-[11px] leading-relaxed">
                        {result.intent && (
                          <p className="mb-1.5 text-text-secondary">
                            <span className="font-semibold text-text">Intenção:</span> {result.intent}
                          </p>
                        )}
                        <p className="mb-1 text-text-secondary">
                          <span className="font-semibold text-text">Dados consultados:</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {result.summaries.map((s) => (
                            <span key={s} className="rounded-md border border-primary/20 bg-app-alt px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">
                              {s.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-dashed border-border px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <Sparkles className="h-3 w-3" />
            Gerado pela IA a partir dos pontos do mês
          </span>
          <button
            onClick={generate}
            disabled={status === "loading"}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-primary disabled:opacity-40"
          >
            <RotateCcw className="h-3 w-3" />
            Gerar novamente
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
