export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// Meta pró-rata: quantos pontos a pessoa já deveria ter entregue até hoje,
// assumindo ritmo linear ao longo do mês em relação à meta mensal.
export function expectedPointsToDate(monthlyCapacityPoints: number, now: Date = new Date()): number {
  const total = daysInMonth(now);
  const day = Math.min(now.getDate(), total);
  return Math.round(monthlyCapacityPoints * (day / total));
}

export type PaceStatus = "em-dia" | "atrasado";

export function paceStatus(pointsEarned: number, expected: number): PaceStatus {
  if (expected <= 0) return "em-dia";
  return pointsEarned >= expected * 0.9 ? "em-dia" : "atrasado";
}

// Classificação de gestão por pessoa, a partir só dos pontos (comprometido x
// capacidade x entregue): "sobrecarregado" tem mais trabalho comprometido do
// que cabe no mês (sinal para alocar mais gente); "não produtivo" tem folga
// de capacidade mas não está entregando no ritmo esperado (sinal de
// performance, não de excesso de carga); os dois nunca se sobrepõem.
export type PersonPaceStatus = "sobrecarregado" | "nao-produtivo" | "em-dia";

export function personPaceStatus(
  monthlyCapacityPoints: number,
  pointsCommitted: number,
  pointsEarned: number,
  now: Date = new Date()
): PersonPaceStatus {
  const utilizationPct = monthlyCapacityPoints > 0 ? (pointsCommitted / monthlyCapacityPoints) * 100 : 0;
  if (utilizationPct > 110) return "sobrecarregado";
  const expected = expectedPointsToDate(monthlyCapacityPoints, now);
  if (expected > 0 && pointsEarned < expected * 0.7) return "nao-produtivo";
  return "em-dia";
}
