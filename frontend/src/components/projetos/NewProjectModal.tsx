import { useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { SubmissionForm } from "@/components/projetos/SubmissionForm";

export function NewProjectModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-card border border-border bg-surface shadow-token-lg">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Nova Ideia
            </span>
            <h2 className="text-[16px] font-semibold text-text">Submissão de Nova Ideia</h2>
            <p className="mt-1 text-[12px] text-text-tertiary">
              Pré-avaliação automática de IA — enquadramento e priorização preliminar antes de entrar no funil de captação.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-tertiary transition-colors hover:border-primary/40 hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">
          <SubmissionForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
