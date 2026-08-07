import { timeProgressFraction } from "@/lib/execution";
import type { Project } from "@/types/domain";

export interface RiskReason {
  label: string;
  severity: "alta" | "media";
}

// TRL que o projeto já deveria ter alcançado dado o tempo decorrido entre
// início e prazo final — mapeamento linear de 1 (início) a 9 (prazo).
export function expectedTrlByTime(project: Project, now: Date = new Date()): number {
  const frac = timeProgressFraction(project, now);
  return Math.min(9, Math.max(1, Math.round(1 + frac * 8)));
}

// Leitura 100% determinística a partir dos próprios indicadores do projeto —
// SPI/CPI, avanço de TRL frente ao prazo e ritmo de consumo orçamentário.
// Não depende de IA nem de dado externo: é "o que os números já mostram".
export function internalRiskReasons(project: Project, now: Date = new Date()): RiskReason[] {
  const reasons: RiskReason[] = [];

  if (project.spi !== null) {
    if (project.spi < 0.85) reasons.push({ label: `Atraso relevante de cronograma — SPI ${project.spi.toFixed(2)}`, severity: "alta" });
    else if (project.spi < 0.97) reasons.push({ label: `Cronograma levemente atrasado — SPI ${project.spi.toFixed(2)}`, severity: "media" });
  }

  if (project.cpi !== null) {
    if (project.cpi < 0.85) reasons.push({ label: `Estouro relevante de custo — CPI ${project.cpi.toFixed(2)}`, severity: "alta" });
    else if (project.cpi < 0.97) reasons.push({ label: `Custo levemente acima do previsto — CPI ${project.cpi.toFixed(2)}`, severity: "media" });
  }

  const expectedTrl = expectedTrlByTime(project, now);
  const gap = expectedTrl - project.trl;
  if (gap >= 2) {
    reasons.push({
      label: `Maturidade bem abaixo do esperado — está em TRL ${project.trl}, o prazo decorrido já indicaria por volta de TRL ${expectedTrl}`,
      severity: "alta",
    });
  } else if (gap === 1) {
    reasons.push({ label: `Um nível de TRL abaixo do esperado para o prazo (atual TRL ${project.trl}, esperado TRL ${expectedTrl})`, severity: "media" });
  }

  const timeFrac = timeProgressFraction(project, now);
  const spentPct = project.budgetK > 0 ? project.spentK / project.budgetK : 0;
  if (spentPct - timeFrac > 0.15) {
    reasons.push({
      label: `Orçamento sendo consumido mais rápido que o prazo (${Math.round(spentPct * 100)}% gasto vs ${Math.round(timeFrac * 100)}% do prazo decorrido)`,
      severity: "media",
    });
  }

  return reasons;
}

export interface ReallocationSuggestion {
  from: Project;
  to: Project;
  sameVertical: boolean;
}

// Sugestão de portfólio: quando um projeto está com saúde ruim E prioridade
// baixa frente a outro projeto em execução mais saudável e mais prioritário,
// vale considerar mover gente/orçamento do primeiro para o segundo — prefere
// candidatos da mesma vertical (mesmo time, realocação mais direta), cai para
// qualquer vertical só se não houver opção melhor dentro dela.
export function reallocationSuggestion(project: Project, executingProjects: Project[]): ReallocationSuggestion | null {
  if (project.health !== "critical") return null;

  const candidates = executingProjects.filter(
    (o) => o.id !== project.id && o.health !== "critical" && o.priorityScoreDefault > project.priorityScoreDefault
  );
  if (candidates.length === 0) return null;

  const sameVertical = candidates.filter((o) => o.vertical === project.vertical);
  const pool = sameVertical.length > 0 ? sameVertical : candidates;
  const best = pool.sort((a, b) => b.priorityScoreDefault - a.priorityScoreDefault)[0];

  return { from: project, to: best, sameVertical: sameVertical.length > 0 };
}
