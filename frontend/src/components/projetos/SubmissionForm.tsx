import { useState, type ReactNode } from "react";
import { Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { useProjects, useVerticals, useProjectTypes } from "@/hooks/usePortfolio";
import { useWeightsStore } from "@/store/weightsStore";
import { lensDefs } from "@/config/lenses";
import { verticalNames } from "@/config/verticals";
import { rankProjects, weightedTotal } from "@/lib/priority";
import { inferVertical, inferType, inferTrl, inferScores, buildIntakeNarrative } from "@/lib/aiIntake";
import type { Project, ProjectScores, ProjectTypeId, VerticalId } from "@/types/domain";

interface Analysis {
  vertical: VerticalId;
  type: ProjectTypeId;
  trl: number;
  scores: ProjectScores;
  rank: number;
  total: number;
  narrative: string;
}

const emptyForm = { name: "", description: "", tir: 15, vpl: 1500, budget: 800 };

export function SubmissionForm() {
  const [form, setForm] = useState(emptyForm);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [registered, setRegistered] = useState(false);

  const { data: projectsData } = useProjects({ limit: 200 });
  const { data: verticals } = useVerticals();
  const { data: types } = useProjectTypes();
  const weights = useWeightsStore((s) => s.weights);

  function runAnalysis() {
    if (!projectsData) return;
    const vertical = inferVertical(`${form.name} ${form.description}`);
    const type = inferType(`${form.name} ${form.description}`);
    const trl = inferTrl(`${form.name} ${form.description}`);
    const scores = inferScores(form.name, form.description, form.tir, form.vpl);

    const draft: Project = {
      id: "draft",
      code: "NOVO",
      name: form.name || "Nova ideia",
      vertical,
      type,
      funnelStage: "captacao",
      trl,
      tirPercent: form.tir,
      vplValueK: form.vpl,
      budgetK: form.budget,
      spentK: 0,
      scores,
      priorityScoreDefault: 0,
      health: "on-track",
      spi: null,
      cpi: null,
      leaderId: "",
      sponsorId: "",
      startDate: new Date().toISOString().slice(0, 10),
      targetDate: new Date().toISOString().slice(0, 10),
      description: form.description,
      tags: [],
    };

    const ranked = rankProjects([...projectsData.items, draft], weights);
    const rank = ranked.findIndex((r) => r.project.id === "draft") + 1;

    setAnalysis({
      vertical,
      type,
      trl,
      scores,
      rank,
      total: ranked.length,
      narrative: buildIntakeNarrative(verticalNames[vertical], rank, ranked.length),
    });
    setRegistered(false);
  }

  function updateScore(lens: keyof ProjectScores, value: number) {
    if (!analysis) return;
    setAnalysis({ ...analysis, scores: { ...analysis.scores, [lens]: value } });
  }

  const liveScore = analysis ? weightedTotal(analysis.scores, weights) : 0;

  function reset() {
    setForm(emptyForm);
    setAnalysis(null);
    setRegistered(false);
  }

  if (registered) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <div>
          <p className="text-[16px] font-semibold text-text">Ideia registrada com sucesso</p>
          <p className="mt-1 max-w-md text-[13px] text-text-secondary">
            "{form.name}" foi enviada para a etapa de Triagem do funil de inovação, com a pré-avaliação da IA
            anexada para a equipe responsável.
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-[13px] font-semibold text-on-primary hover:bg-primary-hover"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Registrar outra ideia
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-3.5">
        <Field label="Nome da ideia">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex.: Sensor de profundidade para grade aradora"
            className="w-full rounded-md border border-border bg-app-alt px-3 py-2 text-[13px] text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </Field>
        <Field label="Descrição">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Descreva a ideia — a IA usa este texto para sugerir vertical, tipo e maturidade."
            className="w-full resize-none rounded-md border border-border bg-app-alt px-3 py-2 text-[13px] text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="TIR estimada (%)">
            <input
              type="number"
              value={form.tir}
              onChange={(e) => setForm({ ...form, tir: Number(e.target.value) })}
              className="w-full rounded-md border border-border bg-app-alt px-3 py-2 text-[13px] text-text outline-none focus:border-primary"
            />
          </Field>
          <Field label="VPL (R$ mil)">
            <input
              type="number"
              value={form.vpl}
              onChange={(e) => setForm({ ...form, vpl: Number(e.target.value) })}
              className="w-full rounded-md border border-border bg-app-alt px-3 py-2 text-[13px] text-text outline-none focus:border-primary"
            />
          </Field>
          <Field label="Orçamento (R$ mil)">
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              className="w-full rounded-md border border-border bg-app-alt px-3 py-2 text-[13px] text-text outline-none focus:border-primary"
            />
          </Field>
        </div>
        <button
          onClick={runAnalysis}
          disabled={!form.name || !projectsData}
          className="mt-1 flex items-center justify-center gap-2 rounded-btn bg-primary py-2.5 text-[13.5px] font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4" />
          Analisar com IA
        </button>
      </div>

      <div className="rounded-md border border-border bg-app-alt/40 p-4">
        {!analysis ? (
          <p className="flex h-full items-center justify-center py-12 text-center text-[13px] text-text-tertiary">
            Preencha a ideia e clique em "Analisar com IA" para ver o enquadramento sugerido.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 rounded-md border border-primary-soft bg-primary-soft/50 p-3.5">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-[12.5px] leading-relaxed text-text-secondary">{analysis.narrative}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Vertical sugerida">
                <select
                  value={analysis.vertical}
                  onChange={(e) => setAnalysis({ ...analysis, vertical: e.target.value as VerticalId })}
                  className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[12.5px] text-text outline-none focus:border-primary"
                >
                  {verticals?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo sugerido">
                <select
                  value={analysis.type}
                  onChange={(e) => setAnalysis({ ...analysis, type: e.target.value as ProjectTypeId })}
                  className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[12.5px] text-text outline-none focus:border-primary"
                >
                  {types?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="TRL estimado">
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={analysis.trl}
                  onChange={(e) => setAnalysis({ ...analysis, trl: Number(e.target.value) })}
                  className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[12.5px] text-text outline-none focus:border-primary"
                />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Estimativa de critérios · ajustável
              </p>
              <div className="flex flex-col gap-2.5">
                {lensDefs.map((lens) => (
                  <div key={lens.id}>
                    <div className="mb-1 flex items-center justify-between text-[11.5px]">
                      <span className="flex items-center gap-1.5 font-medium text-text-secondary">
                        <lens.icon className="h-3.5 w-3.5" />
                        {lens.short}
                      </span>
                      <span className="font-mono font-semibold text-text">{analysis.scores[lens.id]}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={analysis.scores[lens.id]}
                      onChange={(e) => updateScore(lens.id, Number(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: "var(--primary)" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3.5">
              <div>
                <p className="font-mono text-[22px] font-bold leading-none text-primary">{liveScore.toFixed(1)}</p>
                <p className="mt-1 text-[10.5px] uppercase tracking-wide text-text-tertiary">
                  score com pesos atuais · posição estimada #{analysis.rank}
                </p>
              </div>
              <button
                onClick={() => setRegistered(true)}
                className="rounded-btn bg-primary px-4 py-2.5 text-[13px] font-semibold text-on-primary hover:bg-primary-hover"
              >
                Registrar Projeto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-text-tertiary">{label}</span>
      {children}
    </label>
  );
}
