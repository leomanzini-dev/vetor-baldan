import { Link } from "react-router-dom";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useFunnelStages, useProjectTypes, useVerticals } from "@/hooks/usePortfolio";
import { useParamsStore } from "@/store/paramsStore";
import { useWeightsStore } from "@/store/weightsStore";
import { useTrlStore } from "@/store/trlStore";
import { useThemeStore } from "@/store/themeStore";
import { Panel } from "@/components/ui/Panel";
import { lensDefs } from "@/config/lenses";
import { trlColor } from "@/config/chartPalette";

const hoursTiers = [4, 6, 8];

export function ParametrizacaoPage() {
  const pointsPerHour = useParamsStore((s) => s.pointsPerHour);
  const workingDaysPerMonth = useParamsStore((s) => s.workingDaysPerMonth);
  const setPointsPerHour = useParamsStore((s) => s.setPointsPerHour);
  const setWorkingDaysPerMonth = useParamsStore((s) => s.setWorkingDaysPerMonth);
  const resetParams = useParamsStore((s) => s.reset);

  const weights = useWeightsStore((s) => s.weights);
  const trlLevels = useTrlStore((s) => s.levels);
  const themeMode = useThemeStore((s) => s.mode);

  const { data: verticals } = useVerticals();
  const { data: types } = useProjectTypes();
  const { data: funnelStages } = useFunnelStages();

  const weightSum = lensDefs.reduce((sum, l) => sum + weights[l.id], 0) || 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Central de Parametrização</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          O princípio que atravessa toda a plataforma: tudo é editável. A Baldan molda o VETOR ao seu processo
          — não o contrário.
        </p>
      </div>

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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          title="Priorização — Lentes & Pesos"
          subtitle="Editável em contexto, junto ao ranking"
          action={
            <Link to="/priorizacao" className="flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary-hover">
              Editar <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="flex flex-col gap-2.5">
            {lensDefs.map((lens) => {
              const pct = Math.round((weights[lens.id] / weightSum) * 100);
              return (
                <div key={lens.id} className="flex items-center gap-3">
                  <lens.icon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                  <span className="w-36 shrink-0 truncate text-[12px] text-text-secondary">{lens.short}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-app-alt">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-9 shrink-0 text-right font-mono text-[11px] text-text-tertiary">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Maturidade — Escala TRL"
          subtitle="9 níveis, editáveis em contexto"
          action={
            <Link to="/maturidade" className="flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary-hover">
              Editar <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="flex flex-wrap gap-2">
            {trlLevels.map((level) => (
              <span
                key={level.level}
                title={level.title}
                className="flex items-center gap-2 rounded-full border border-border bg-app-alt px-3 py-1.5"
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: trlColor(level.level, themeMode) }}
                >
                  {level.level}
                </span>
                <span className="text-[11.5px] font-medium text-text-secondary">{level.title}</span>
              </span>
            ))}
          </div>
        </Panel>
      </div>

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
    </div>
  );
}
