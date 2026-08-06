// Sumário: Security Guard (dados mocados — não há backend real de segurança)

export function buildSegurancaSummary(): string {
  const lines: string[] = [
    "#-# SECURITY GUARD",
    "",
    "O módulo Security Guard exibe eventos de segurança simulados.",
    "Três tipos de ator monitorados:",
    "  USER — acesso autenticado (verde)",
    "  BOT — requisição sem sessão válida (vermelho)",
    "  SSH_TRY — tentativa de acesso SSH (roxo)",
    "",
    "Os dados são gerados em tempo real por PRNG determinístico",
    "e não refletem acessos reais ao sistema.",
    "",
    "Funcionalidades:",
    "  - Grafo SVG animado com nós por fonte de acesso",
    "  - Feed lateral com os 10 eventos mais recentes",
    "  - Modal de detalhe ao clicar em um nó",
    "  - Contadores USER/BOT/SSH/TOTAL na topbar",
    "  - Refresh automático a cada 8 segundos",
  ];

  return lines.join("\n");
}
