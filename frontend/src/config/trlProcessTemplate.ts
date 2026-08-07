import type { VerticalId } from "@/types/domain";
import { verticalOrder } from "@/config/verticals";

export type PeriodUnit = "dias" | "meses";

export interface TrlProcessStep {
  id: string;
  name: string;
  hours: number;
  periodValue: number; // quanto tempo deve levar a conclusão, na unidade abaixo
  periodUnit: PeriodUnit;
}

export function templateKey(vertical: VerticalId, level: number): string {
  return `${vertical}-${level}`;
}

// Sequência padrão de processos por nível TRL — espelha o que cada nível
// exige (ver config/trl.ts), quebrado em passos executáveis. Serve de ponto
// de partida igual para as 4 verticais; cada uma pode ser customizada
// separadamente em Parametrização (adicionar/remover passos), pois o
// processo real de cada frente de produto tende a divergir com o tempo.
const baseStepsByLevel: string[][] = [
  ["Registrar a ideia e o princípio técnico", "Levantar a necessidade de campo correspondente"],
  ["Elaborar memorial descritivo preliminar", "Formular hipóteses de engenharia"],
  ["Executar simulação (CAE/CFD)", "Realizar ensaio de bancada", "Registrar resultado em relatório técnico"],
  ["Montar protótipo funcional", "Executar ensaio em banco de provas", "Consolidar relatório de ensaio"],
  ["Revisar protótipo com base nos testes", "Planejar teste em ambiente simulado", "Executar teste em ambiente simulado"],
  ["Preparar unidade para teste de campo", "Acompanhar demonstração em campo real", "Registrar relatório técnico de desempenho"],
  ["Instalar unidade piloto em cliente/parceiro", "Formalizar acordo de teste", "Acompanhar operação em escala real"],
  ["Concluir homologação técnica", "Validar processo produtivo", "Preparar documentação para produção em série"],
  ["Iniciar produção em série", "Acompanhar histórico de pós-venda"],
];

// Valores padrão de esforço/prazo dos passos gerados — ponto de partida
// genérico (8h, 5 dias), totalmente editável depois em Parametrização.
const DEFAULT_HOURS = 8;
const DEFAULT_PERIOD_VALUE = 5;
const DEFAULT_PERIOD_UNIT: PeriodUnit = "dias";

export function buildDefaultTemplate(): Record<string, TrlProcessStep[]> {
  const template: Record<string, TrlProcessStep[]> = {};
  for (const vertical of verticalOrder) {
    baseStepsByLevel.forEach((steps, idx) => {
      const level = idx + 1;
      template[templateKey(vertical, level)] = steps.map((name, i) => ({
        id: `${vertical}-${level}-${i}`,
        name,
        hours: DEFAULT_HOURS,
        periodValue: DEFAULT_PERIOD_VALUE,
        periodUnit: DEFAULT_PERIOD_UNIT,
      }));
    });
  }
  return template;
}
