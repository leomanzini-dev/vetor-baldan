import { useState } from "react";
import { Bot, Brain, Loader2, RotateCcw, Sparkles } from "lucide-react";

interface QuickPrompt {
  label: string;
  question: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: "Resumo executivo", question: "Dê um resumo executivo do estado atual do portfólio, destacando os pontos mais importantes para a diretoria." },
  { label: "Maiores riscos", question: "Quais são os maiores riscos no portfólio agora e o que fazer a respeito?" },
  { label: "Oportunidades", question: "Onde estão as maiores oportunidades no portfólio agora?" },
  { label: "Saúde da execução", question: "Resuma a saúde geral da execução do portfólio (SPI, CPI, projetos críticos)." },
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
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="ai-chat-glow flex flex-col gap-4 rounded-card bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Sparkles className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-text">Briefing Executivo da IA</h3>
          <p className="text-[12px] text-text-tertiary">Gerado em tempo real pela IA do VETOR sobre os dados atuais</p>
        </div>
      </div>

      {status === "idle" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12.5px] leading-relaxed text-text-tertiary">
            Peça uma leitura interpretativa do portfólio agora — não é um texto fixo, é gerado pela IA a cada chamada.
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => generate(p)}
                className="rounded-full border border-border bg-app-alt px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-app-alt/60 px-4 py-6 justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[13px] text-text-tertiary">Pensando... isso pode levar alguns segundos</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-app-alt/60 px-4 py-4">
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
        <div className="flex flex-col gap-3">
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
          <div className="flex flex-wrap gap-2 border-t border-dashed border-border pt-3">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => generate(p)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  p.label === result.question
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-app-alt text-text-secondary hover:border-primary hover:text-primary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
