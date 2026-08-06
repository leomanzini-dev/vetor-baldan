import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { AiChatModal } from "./AiChatModal";

interface PageContext {
  name: string;
  summaryId: string;
}

const PAGE_CONTEXT: Record<string, PageContext> = {
  "/":              { name: "Painel Executivo",        summaryId: "VISAO_GERAL" },
  "/priorizacao":   { name: "Priorização Multicritério", summaryId: "PRIORIZACAO" },
  "/maturidade":    { name: "Maturidade Tecnológica",  summaryId: "MATURIDADE" },
  "/execucao":      { name: "Execução & Capacidade",   summaryId: "EXECUCAO" },
  "/projetos":      { name: "Catálogo de Projetos",    summaryId: "PROJETOS" },
  "/parametrizacao": { name: "Parametrização",          summaryId: "VISAO_GERAL" },
  "/perfis":        { name: "Perfis & Acessos",        summaryId: "EQUIPE" },
  "/ia":            { name: "VETOR IA",                summaryId: "VISAO_GERAL" },
};

const FALLBACK: PageContext = { name: "VETOR", summaryId: "VISAO_GERAL" };

export function AiOrb() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const ctx = PAGE_CONTEXT[location.pathname] ?? FALLBACK;

  // Não mostrar o orb na página da IA (já tem chat próprio) nem nos overlays fullscreen
  if (location.pathname === "/ia" || location.pathname === "/seguranca" || location.pathname === "/sentinela") return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`IA · ${ctx.name}`}
        className="fixed bottom-6 right-6 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-token-lg transition-transform hover:scale-110 active:scale-95"
      >
        <Sparkles className="h-5 w-5" />
      </button>

      {open && (
        <AiChatModal
          pageName={ctx.name}
          summaryId={ctx.summaryId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
