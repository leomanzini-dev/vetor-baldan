import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Bot, Loader2, RotateCcw, Globe } from "lucide-react";
import { verticalNames } from "@/config/verticals";
import { aiFetch } from "@/lib/aiFetch";
import type { Project } from "@/types/domain";

interface Props {
  project: Project;
  onClose: () => void;
}

function humanizeType(type: string): string {
  return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProjectRiskAnalysisModal({ project, onClose }: Props) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [answer, setAnswer] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  async function generate() {
    setStatus("loading");
    setAnswer(null);
    try {
      const data = await aiFetch("/api/ai/external-risk", {
        projectCode: project.code,
        projectName: project.name,
        vertical: verticalNames[project.vertical],
        type: humanizeType(project.type),
        trl: project.trl,
        spi: project.spi,
        cpi: project.cpi,
        health: project.health,
        description: project.description,
      });
      setAnswer(data.answer);
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Globe className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-semibold text-text">Fatores externos</h2>
            <p className="truncate text-[11.5px] text-text-tertiary">
              {project.code} · {project.name}
            </p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:text-text">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 rounded-md border border-warning-soft bg-warning-soft/40 px-3 py-2 text-[11px] leading-relaxed text-warning">
            A IA não tem acesso a notícias, cotações ou dados de mercado ao vivo — ela raciocina com conhecimento
            geral a partir da data de hoje (por isso pode citar coisas como ano de eleição ou época de safra, mas
            não um número de câmbio "de hoje"). São hipóteses a verificar, não fatos confirmados.
          </p>

          {status === "loading" && (
            <div className="flex items-center justify-center gap-2.5 rounded-lg border border-border bg-app-alt/60 px-4 py-8">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-[13px] text-text-tertiary">A IA está levantando hipóteses de risco externo...</span>
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

          {status === "done" && answer && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-app-alt/60 px-3.5 py-3 text-[13px] leading-relaxed text-text-secondary">
                <p className="whitespace-pre-wrap">{answer}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-dashed border-border px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <Globe className="h-3 w-3" />
            Hipóteses, não dados verificados
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
