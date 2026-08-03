export function formatCurrencyK(valueK: number): string {
  const value = valueK * 1000;
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  }
  return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

export function formatIndex(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// "YYYY-MM-DD" interpretado como data LOCAL, não UTC — new Date("2022-01-01")
// nativo parseia como UTC meia-noite, que em fusos atrás de UTC (ex.: Brasil)
// exibe/computa como 31/12/2021. Sempre usar isto para datas vindas da API.
export function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
