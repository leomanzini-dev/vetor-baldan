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
