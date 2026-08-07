import { useState } from "react";
import { AlertTriangle, Bot, Brain, FileText, Gauge, Loader2, RotateCcw, Sparkles, TrendingUp } from "lucide-react";

interface QuickPrompt {
  label: string;
  question: string;
  description: string;
  icon: typeof Sparkles;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: "Resumo executivo",
    question: "Dê um resumo executivo do estado atual do portfólio, destacando os pontos mais importantes para a diretoria.",
    description: "Visão geral pronta para a diretoria",
    icon: FileText,
  },
  {
    label: "Maiores riscos",
    question: "Quais são os maiores riscos no portfólio agora e o que fazer a respeito?",
    description: "O que está ameaçando o resultado",
    icon: AlertTriangle,
  },
  {
    label: "Oportunidades",
    question: "Onde estão as maiores oportunidades no portfólio agora?",
    description: "Onde acelerar para capturar mais valor",
    icon: TrendingUp,
  },
  {
    label: "Saúde da execução",
    question: "Resuma a saúde geral da execução do portfólio (SPI, CPI, projetos críticos).",
    description: "SPI, CPI e projetos em risco",
    icon: Gauge,
  },
];

interface Result {
  question: string;
  answer: string;
  summaries?: string[];
  intent?: string;
}

export function AiBriefingCard() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [answeredAt, setAnsweredAt] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);

  async function generate(prompt: QuickPrompt) {
    setStatus("loading");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `[Contexto: painel executivo do portfólio] ${prompt.question}`,
          history: [],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult({ question: prompt.label, answer: data.answer, summaries: data.summaries, intent: data.intent });
      setAnsweredAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="ai-chat-glow relative overflow-hidden rounded-card bg-surface p-6">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-token-md">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[18px] font-semibold tracking-tight text-text">Briefing Executivo da IA</h2>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-primary">
                  Tempo real
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-text-tertiary">
                A leitura que diretoria e liderança pedem todo dia — gerada agora, direto dos dados do portfólio, nunca um texto fixo.
              </p>
            </div>
          </div>
        </div>

        {status === "idle" && (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => generate(p)}
                className="group flex flex-col items-start gap-2.5 rounded-xl border border-border bg-app-alt/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary-soft/40 hover:shadow-token-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-transform group-hover:scale-110">
                  <p.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[13px] font-semibold text-text">{p.label}</span>
                <span className="text-[11px] leading-snug text-text-tertiary">{p.description}</span>
              </button>
            ))}
          </div>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-border bg-app-alt/60 px-4 py-10">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-[13px] text-text-tertiary">Analisando o portfólio... isso pode levar alguns segundos</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-app-alt/60 px-4 py-4">
            <p className="text-[12.5px] leading-relaxed text-text-tertiary">
              Não foi possível gerar o briefing agora — o backend de IA pode estar indisponível (por exemplo, numa versão publicada sem servidor).
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="flex w-fit items-center gap-1.5 text-[12px] font-semibold text-primary"
            >
              <RotateCcw className="h-3 w-3" /> Tentar de novo
            </button>
          </div>
        )}

        {status === "done" && result && (
          <div className="flex flex-col gap-3.5">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-app-alt/60 px-4 py-3.5 text-[13.5px] leading-relaxed text-text-secondary">
                <p className="whitespace-pre-wrap">{result.answer}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-dashed border-border pt-2.5">
                  {answeredAt && (
                    <span className="text-[10.5px] text-text-tertiary">Gerado agora às {answeredAt}</span>
                  )}
                  {result.summaries && result.summaries.length > 0 && (
                    <button
                      onClick={() => setShowThinking((v) => !v)}
                      className="flex items-center gap-1 text-[10.5px] font-semibold text-text-tertiary transition-colors hover:text-primary"
                    >
                      <Brain className="h-3 w-3" />
                      {showThinking ? "Fechar" : "Como a IA pensou"}
                    </button>
                  )}
                </div>
                {showThinking && result.summaries && (
                  <div className="mt-2.5 rounded-lg border border-primary/20 bg-primary-soft/30 px-3 py-2.5 text-[11px] leading-relaxed">
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
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-dashed border-border pt-3.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => generate(p)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    p.label === result.question
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-app-alt text-text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  <p.icon className="h-3 w-3" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
