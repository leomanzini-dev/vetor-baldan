import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  SlidersHorizontal,
  Gauge,
  Layers,
  Boxes,
  ListChecks,
  ArrowRight,
  RotateCcw,
  Star,
  Plus,
  Sparkles,
  CheckCircle2,
  Check,
  Pencil,
  PartyPopper,
  X,
} from "lucide-react";
import { useFunnelStages, useProjectTypes, useVerticals } from "@/hooks/usePortfolio";
import { useParamsStore } from "@/store/paramsStore";
import { useWeightsStore } from "@/store/weightsStore";
import { Panel } from "@/components/ui/Panel";
import { useAllLenses } from "@/hooks/useLenses";
import { PresetPreviewBar } from "@/components/parametrizacao/PresetPreviewBar";
import { PresetEditModal, type EditablePreset } from "@/components/parametrizacao/PresetEditModal";
import { PresetCreateModal, type SeedOption } from "@/components/parametrizacao/PresetCreateModal";
import { MicroStageManager } from "@/components/parametrizacao/MicroStageManager";
import { TrlProcessTemplateEditor } from "@/components/parametrizacao/TrlProcessTemplateEditor";
import { TrlScaleEditor } from "@/components/parametrizacao/TrlScaleEditor";
import { weightPresets, type LensId } from "@/config/lenses";

const hoursTiers = [4, 6, 8];

type Tab = "lentes" | "capacidade" | "maturidade" | "microetapas" | "estrutura";

const tabs: { id: Tab; label: string; icon: typeof SlidersHorizontal }[] = [
  { id: "lentes", label: "Lentes & Pesos", icon: SlidersHorizontal },
  { id: "capacidade", label: "Capacidade", icon: Gauge },
  { id: "maturidade", label: "Maturidade", icon: Layers },
  { id: "microetapas", label: "Micro-etapas", icon: ListChecks },
  { id: "estrutura", label: "Estrutura", icon: Boxes },
];

export function ParametrizacaoPage() {
  const [searchParams] = useSearchParams();
  const initialTab = tabs.find((t) => t.id === searchParams.get("tab"))?.id ?? "lentes";
  const [tab, setTab] = useState<Tab>(initialTab);
  const navigate = useNavigate();

  const pointsPerHour = useParamsStore((s) => s.pointsPerHour);
  const workingDaysPerMonth = useParamsStore((s) => s.workingDaysPerMonth);
  const setPointsPerHour = useParamsStore((s) => s.setPointsPerHour);
  const setWorkingDaysPerMonth = useParamsStore((s) => s.setWorkingDaysPerMonth);
  const resetParams = useParamsStore((s) => s.reset);

  const weights = useWeightsStore((s) => s.weights);
  const activePresetId = useWeightsStore((s) => s.activePresetId);
  const presetWeights = useWeightsStore((s) => s.presetWeights);
  const customPresets = useWeightsStore((s) => s.customPresets);
  const customLenses = useWeightsStore((s) => s.customLenses);
  const applyPreset = useWeightsStore((s) => s.applyPreset);
  const removeCustomPreset = useWeightsStore((s) => s.removeCustomPreset);
  const updatePresetWeights = useWeightsStore((s) => s.updatePresetWeights);
  const updateCustomPresetMeta = useWeightsStore((s) => s.updateCustomPresetMeta);
  const createPreset = useWeightsStore((s) => s.createPreset);
  const allLenses = useAllLenses();

  const { data: verticals } = useVerticals();
  const { data: types } = useProjectTypes();
  const { data: funnelStages } = useFunnelStages();

  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [creatingPreset, setCreatingPreset] = useState(false);
  const [appliedToast, setAppliedToast] = useState<{ id: string; label: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const weightSum = allLenses.reduce((sum, l) => sum + (weights[l.id] ?? 0), 0) || 1;
  const allPresets = [
    ...weightPresets.map((p) => ({ id: p.id, label: p.label, description: p.description })),
    ...customPresets,
  ];

  // Aplica o cenário sem sair da tela — quem quiser ver o efeito no ranking
  // decide isso clicando no toast, não é forçado pra lá.
  function applyPresetHere(presetId: string, label: string) {
    applyPreset(presetId, presetWeights[presetId] ?? {});
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setAppliedToast({ id: presetId, label });
    toastTimer.current = setTimeout(() => setAppliedToast(null), 6000);
  }

  function goCheckInPriorizacao() {
    setAppliedToast(null);
    navigate("/priorizacao");
  }

  const seedOptions: SeedOption[] = [
    ...weightPresets.map((p) => ({ id: p.id, label: p.label, weights: presetWeights[p.id] ?? p.weights })),
    { id: "live", label: "Pesos atuais da Priorização", weights },
  ];

  function handleCreatePreset(label: string, description: string, presetWeightsInput: Record<LensId, number>) {
    createPreset(label, description, presetWeightsInput);
    setCreatingPreset(false);
  }

  const editingPreset: EditablePreset | null = (() => {
    if (!editingPresetId) return null;
    const meta = allPresets.find((p) => p.id === editingPresetId);
    if (!meta) return null;
    return {
      id: meta.id,
      label: meta.label,
      description: meta.description,
      weights: presetWeights[meta.id] ?? {},
      isBuiltin: weightPresets.some((p) => p.id === meta.id),
      isBaseline: meta.id === "padrao",
    };
  })();

  function handleSavePreset(nextWeights: Record<LensId, number>, label: string, description: string) {
    if (!editingPresetId) return;
    updatePresetWeights(editingPresetId, nextWeights);
    if (!weightPresets.some((p) => p.id === editingPresetId)) {
      updateCustomPresetMeta(editingPresetId, label, description);
    }
    setEditingPresetId(null);
  }

  function handleDeletePreset() {
    if (!editingPresetId) return;
    removeCustomPreset(editingPresetId);
    setEditingPresetId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Central de Parametrização</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          O princípio que atravessa toda a plataforma: tudo é editável. A Baldan molda o VETOR ao seu processo
          — não o contrário.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border [scrollbar-width:none]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                active ? "border-primary text-primary" : "border-transparent text-text-tertiary hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "lentes" && (
        <div className="flex flex-col gap-5">
          <Panel
            title="Lentes do Modelo"
            subtitle={`${allLenses.length} lentes ativas · ${customLenses.length} personalizada${customLenses.length === 1 ? "" : "s"}`}
            action={
              <Link to="/priorizacao" className="flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary-hover">
                Editar pesos <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            <div className="flex flex-col gap-2.5">
              {allLenses.map((lens) => {
                const value = weights[lens.id] ?? 0;
                const pct = Math.round((value / weightSum) * 100);
                const isCustom = customLenses.some((l) => l.id === lens.id);
                return (
                  <div key={lens.id} className="flex items-center gap-3">
                    <lens.icon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                    <span className="w-44 shrink-0 truncate text-[12px] text-text-secondary">
                      {lens.short}
                      {isCustom && <span className="ml-1.5 text-[9px] font-bold uppercase text-text-tertiary/70">(personalizada)</span>}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-app-alt">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-[11px] text-text-tertiary">{value}% peso</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel
            title="Cenários Prontos"
            subtitle="Combinações de peso reutilizáveis — do sistema ou salvas pela equipe em Priorização"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allPresets.map((preset) => {
                const isBuiltin = weightPresets.some((p) => p.id === preset.id);
                const isActive = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`flex flex-col gap-3 rounded-md border p-4 transition-colors ${
                      isActive ? "border-primary bg-primary-soft/30" : "border-border bg-app-alt/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isBuiltin ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-alt text-text-tertiary">
                            <Sparkles className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                            <Star className="h-3 w-3" />
                          </span>
                        )}
                        <span className="text-[13px] font-semibold text-text">{preset.label}</span>
                      </div>
                      {isActive && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                    </div>

                    <p className="min-h-[32px] text-[11.5px] leading-snug text-text-tertiary">{preset.description}</p>

                    <PresetPreviewBar weights={presetWeights[preset.id] ?? {}} lenses={allLenses} />

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => applyPresetHere(preset.id, preset.label)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary py-1.5 text-[11.5px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Aplicar cenário
                      </button>
                      <button
                        onClick={() => setEditingPresetId(preset.id)}
                        title="Editar cenário"
                        aria-label={`Editar cenário ${preset.label}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-tertiary transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary/70">
                      {preset.id === "padrao" ? "Linha de base do sistema" : isBuiltin ? "Padrão do sistema" : "Salvo pela equipe"}
                    </p>
                  </div>
                );
              })}

              <button
                onClick={() => setCreatingPreset(true)}
                className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-4 text-center text-text-tertiary transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[12.5px] font-semibold">Criar novo cenário</span>
                <span className="text-[11px]">Nome, descrição e pesos — tudo aqui mesmo</span>
              </button>
            </div>
          </Panel>
        </div>
      )}

      {tab === "capacidade" && (
        <Panel
          title="Conversão Hora → Ponto"
          subtitle="Coração do sistema de capacidade — cada hora de trabalho equivale a uma fração dos pontos totais"
          action={
            <button
              onClick={resetParams}
              className="flex items-center gap-1 text-[11.5px] font-semibold text-text-tertiary hover:text-primary"
            >
              <RotateCcw className="h-3 w-3" />
              Restaurar padrão
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-text">Pontos por hora</span>
                  <span className="font-mono text-[13px] font-bold text-primary">{pointsPerHour} pts/h</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={pointsPerHour}
                  onChange={(e) => setPointsPerHour(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: "var(--primary)" }}
                />
                <p className="mt-1 text-[11px] text-text-tertiary">
                  Quantos pontos uma hora de trabalho vale. A complexidade da entrega já está absorvida na
                  estimativa de horas — não é um parâmetro separado.
                </p>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-text">Dias úteis por mês</span>
                  <span className="font-mono text-[13px] font-bold text-primary">{workingDaysPerMonth} dias</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={26}
                  value={workingDaysPerMonth}
                  onChange={(e) => setWorkingDaysPerMonth(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: "var(--primary)" }}
                />
                <p className="mt-1 text-[11px] text-text-tertiary">
                  Base de dias úteis usada para calcular a meta mensal de pontos de cada pessoa.
                </p>
              </div>
            </div>

            <div className="rounded-md border border-border bg-app-alt/40 p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Prévia — meta mensal por carga horária
              </p>
              <div className="flex flex-col gap-2.5">
                {hoursTiers.map((h) => (
                  <div key={h} className="flex items-center justify-between rounded-md bg-surface px-3 py-2.5">
                    <span className="text-[12.5px] text-text-secondary">{h}h/dia</span>
                    <span className="font-mono text-[14px] font-bold text-text">
                      {h * workingDaysPerMonth * pointsPerHour}
                      <span className="ml-1 text-[10.5px] font-normal text-text-tertiary">pts/mês</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10.5px] leading-relaxed text-text-tertiary">
                Novas atribuições de micro-etapas passam a usar esta conversão. Metas já creditadas no mês
                corrente (ver Execução) não são recalculadas retroativamente.
              </p>
            </div>
          </div>
        </Panel>
      )}

      {tab === "maturidade" && (
        <Panel
          title="Maturidade — Escala TRL"
          subtitle="9 níveis, totalmente editáveis — o mesmo texto usado no funil, no roadmap e nos sinais de IA"
          action={
            <Link to="/maturidade" className="flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary-hover">
              Ver no Funil <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <TrlScaleEditor />
        </Panel>
      )}

      {tab === "microetapas" && (
        <div className="flex flex-col gap-5">
          <Panel
            title="Sequência de Processos por TRL"
            subtitle="Checklist padrão de passos por nível de maturidade e vertical (4 P's) — reaproveitado ao criar micro-etapas"
          >
            <TrlProcessTemplateEditor />
          </Panel>

          <Panel
            title="Vincular Micro-etapas ao Projeto"
            subtitle="Escolha os passos da sequência padrão, o projeto e o responsável — prazo e pontos vêm da sequência definida acima. Dá para transferir o responsável depois."
          >
            <MicroStageManager />
          </Panel>
        </div>
      )}

      {tab === "estrutura" && (
        <Panel title="Estrutura do Portfólio" subtitle="Vocabulário de domínio usado em toda a plataforma">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Verticais (4 P&apos;s)
              </p>
              <ul className="flex flex-col gap-1.5">
                {verticals?.map((v) => (
                  <li key={v.id} className="text-[12.5px] text-text-secondary">
                    <span className="font-medium text-text">{v.name}</span> — {v.description}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Tipos de Projeto
              </p>
              <ul className="flex flex-col gap-1.5">
                {types?.map((t) => (
                  <li key={t.id} className="text-[12.5px] text-text-secondary">
                    <span className="font-medium text-text">{t.name}</span> — {t.phaseCount} fases
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Estágios do Funil
              </p>
              <ul className="flex flex-col gap-1.5">
                {funnelStages?.map((f) => (
                  <li key={f.id} className="text-[12.5px] text-text-secondary">
                    <span className="font-medium text-text">{f.order}.</span> {f.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      )}

      {editingPreset && (
        <PresetEditModal
          preset={editingPreset}
          lenses={allLenses}
          onClose={() => setEditingPresetId(null)}
          onSave={handleSavePreset}
          onDelete={!editingPreset.isBuiltin ? handleDeletePreset : undefined}
        />
      )}

      {creatingPreset && (
        <PresetCreateModal
          lenses={allLenses}
          seedOptions={seedOptions}
          onClose={() => setCreatingPreset(false)}
          onCreate={handleCreatePreset}
        />
      )}

      <AnimatePresence>
        {appliedToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 z-[110] flex w-[min(94vw,420px)] -translate-x-1/2 items-start gap-3 rounded-card border border-border bg-surface px-4 py-3.5 shadow-token-lg"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
              <PartyPopper className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-text">Cenário aplicado</p>
              <p className="truncate text-[12px] text-text-tertiary">
                "{appliedToast.label}" já está ativo — os pesos foram atualizados.
              </p>
              <button
                onClick={goCheckInPriorizacao}
                className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary-hover"
              >
                Conferir cenário em Priorização
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={() => setAppliedToast(null)}
              aria-label="Fechar"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:text-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
