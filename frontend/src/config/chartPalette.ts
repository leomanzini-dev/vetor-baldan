import type { FunnelStageId, ProjectHealth, VerticalId } from "@/types/domain";

// Paleta categórica das 4 verticais — validada com o script de acessibilidade
// da skill de dataviz (CVD-safe, chroma floor e contraste vs. superfície OK
// em claro e escuro). Ordem fixa, nunca ciclada.
export const verticalChartColors: Record<VerticalId, { light: string; dark: string }> = {
  pulverizacao: { light: "#2E6FBA", dark: "#4A8DD6" },
  "preparo-solo": { light: "#B5651D", dark: "#C97A3A" },
  plantio: { light: "#2E8B57", dark: "#3D9C6C" },
  pecas: { light: "#7B4B94", dark: "#9668AF" },
};

// Paleta de status — fixa, nunca reutilizada como cor categórica. Sempre
// acompanhada de ícone/rótulo (nunca só a cor) por conta do contraste em tema claro.
export const healthColors: Record<ProjectHealth, { light: string; dark: string; label: string }> = {
  "on-track": { light: "#2E7D32", dark: "#4CAF50", label: "Em dia" },
  attention: { light: "#B3790A", dark: "#E6A700", label: "Atenção" },
  critical: { light: "#CB0A26", dark: "#E23A52", label: "Crítico" },
};

export const funnelStageLabels: Record<FunnelStageId, string> = {
  captacao: "Captação",
  triagem: "Triagem",
  avaliacao: "Avaliação",
  gate: "Gate",
  execucao: "Execução",
  encerrado: "Encerrado",
};

export function pickThemed(mode: "light" | "dark", pair: { light: string; dark: string }): string {
  return mode === "dark" ? pair.dark : pair.light;
}

// Cromática de apoio dos gráficos (grade, eixos, tooltip) — espelha os tokens
// de src/index.css em hex sólido, já que SVG nem sempre resolve var() em todo navegador.
export const chartChrome = {
  gridline: { light: "#E7E0D2", dark: "#2C2A27" },
  axisText: { light: "#828282", dark: "#8C8578" },
  tooltipBg: { light: "#FFFFFF", dark: "#201F1D" },
  tooltipBorder: { light: "#E2DACB", dark: "#37342F" },
};

// Rampa sequencial (azul) da paleta de referência da skill de dataviz — usada
// para codificação ORDINAL (TRL 1→9: mais escuro = mais maduro). Passos
// escolhidos respeitando os pisos de contraste da skill: em claro, nunca mais
// claro que o passo 250; em escuro, nunca mais escuro que o passo 600.
export const trlRampLight = ["#86b6ef", "#6da7ec", "#5598e7", "#3987e5", "#2a78d6", "#256abf", "#1c5cab", "#184f95", "#104281"];
export const trlRampDark = ["#9ec5f4", "#86b6ef", "#6da7ec", "#5598e7", "#3987e5", "#2a78d6", "#256abf", "#1c5cab", "#184f95"];

export function trlColor(level: number, mode: "light" | "dark"): string {
  const ramp = mode === "dark" ? trlRampDark : trlRampLight;
  return ramp[Math.min(Math.max(level - 1, 0), 8)];
}

// 3 passos da mesma rampa para as bandas de maturidade (Descoberta/Validação/Escala).
export const trlBandColors = {
  light: [trlRampLight[0], trlRampLight[4], trlRampLight[8]],
  dark: [trlRampDark[0], trlRampDark[4], trlRampDark[8]],
};

// Paleta categórica de 8 tons (azul/laranja/água/amarelo/magenta/verde/violeta/
// vermelho) — a mesma ordem fixa validada pela skill de dataviz (pior par
// adjacente: ΔE CVD 9.1 claro / 8.4 escuro; nunca ciclada). Usada para
// identidade de lente no Eixo 1 (uma cor por lente, sempre acompanhada de
// legenda com nome — a cor nunca carrega o significado sozinha). A partir da
// 9ª lente (personalizadas em excesso), o resto é agrupado em "Outras" com o
// tom neutro abaixo, nunca gerando uma 9ª cor de série.
export const lensCategoricalRamp: { light: string; dark: string }[] = [
  { light: "#2a78d6", dark: "#3987e5" }, // 1 azul
  { light: "#eb6834", dark: "#d95926" }, // 2 laranja
  { light: "#1baf7a", dark: "#199e70" }, // 3 água
  { light: "#eda100", dark: "#c98500" }, // 4 amarelo
  { light: "#e87ba4", dark: "#d55181" }, // 5 magenta
  { light: "#008300", dark: "#008300" }, // 6 verde
  { light: "#4a3aa7", dark: "#9085e9" }, // 7 violeta
  { light: "#e34948", dark: "#e66767" }, // 8 vermelho
];

export const lensOtherColor = { light: "#A9A392", dark: "#6B675A" };

export function lensSlotColor(index: number, mode: "light" | "dark"): string {
  if (index >= lensCategoricalRamp.length) return pickThemed(mode, lensOtherColor);
  return pickThemed(mode, lensCategoricalRamp[index]);
}

// Cores de faixa de prioridade no ranking — paleta de STATUS (ordinal), não
// categórica: espelha os tokens já usados na UI (primary/success/warning/
// neutro) para que "Prioritário" no gráfico bata com o mesmo vermelho usado
// nos badges "maior peso" e "Prioritário" do resto do produto.
export const priorityBandColors = {
  prioritario: { light: "#cb0a26", dark: "#e23a52" },
  alto: { light: "#2e7d32", dark: "#4caf50" },
  medio: { light: "#b3790a", dark: "#e6a700" },
  baixo: { light: "#828282", dark: "#8c8578" },
};
