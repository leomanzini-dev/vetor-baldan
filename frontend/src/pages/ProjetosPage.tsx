import { useState } from "react";
import { LayoutList, Sparkles } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { ProjectCatalog } from "@/components/projetos/ProjectCatalog";
import { SubmissionForm } from "@/components/projetos/SubmissionForm";

type Tab = "catalogo" | "submissao";

export function ProjetosPage() {
  const [tab, setTab] = useState<Tab>("catalogo");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Projetos &amp; Submissão de Ideias</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          O catálogo completo do portfólio e a porta de entrada de novas ideias, já avaliadas por IA no momento
          da submissão.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border [scrollbar-width:none]">
        <button
          onClick={() => setTab("catalogo")}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
            tab === "catalogo" ? "border-primary text-primary" : "border-transparent text-text-tertiary hover:text-text"
          }`}
        >
          <LayoutList className="h-4 w-4" />
          Catálogo
        </button>
        <button
          onClick={() => setTab("submissao")}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
            tab === "submissao" ? "border-primary text-primary" : "border-transparent text-text-tertiary hover:text-text"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Nova Submissão
        </button>
      </div>

      {tab === "catalogo" ? (
        <Panel title="Catálogo de Projetos" subtitle="Busca e filtros sobre os ~180 projetos do portfólio">
          <ProjectCatalog />
        </Panel>
      ) : (
        <Panel title="Submissão de Nova Ideia" subtitle="Pré-avaliação automática de IA — enquadramento e priorização preliminar">
          <SubmissionForm />
        </Panel>
      )}
    </div>
  );
}
