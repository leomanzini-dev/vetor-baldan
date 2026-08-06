import { Shield, Lock, Fingerprint, Radar, KeyRound, Eye } from "lucide-react";
import { screenAccessMatrix } from "@/config/permissions";
import { profileLabels } from "@/config/profiles";
import type { PersonProfile } from "@/types/domain";

// Sentinela — auditoria de acessos do VETOR. Adaptação de um modelo de
// monitoramento de requisições (grafo + feed em tempo real) para um contexto
// sem backend vivo: aqui a "requisição" é uma navegação real dentro da SPA, e
// a classificação autorizado/bloqueado usa a MESMA matriz de permissões
// exibida em Perfis & Acessos — não é decorativo, é o mesmo dado.

export type SentinelaActor = "autorizado" | "bloqueado";
export type SentinelaKind = "navegacao" | "troca-persona" | "anomalia";

export interface SentinelaEvent {
  id: string;
  timestamp: string; // ISO
  personaId: string;
  personaName: string;
  profile: PersonProfile | "desconhecido";
  screen: string;
  screenLabel: string;
  actor: SentinelaActor;
  kind: SentinelaKind;
  reason: string;
}

export const SENTINELA_ICONS = [
  { id: "shield", label: "Guarda de acesso", Icon: Shield },
  { id: "lock", label: "Parametrização protegida", Icon: Lock },
  { id: "fingerprint", label: "Identidade da persona", Icon: Fingerprint },
  { id: "radar", label: "Monitoramento contínuo", Icon: Radar },
  { id: "key", label: "Nível de permissão", Icon: KeyRound },
  { id: "eye", label: "Auditoria de telas", Icon: Eye },
];

function screenLabelFor(path: string): string {
  const found = screenAccessMatrix.find((s) => s.path === path);
  if (found) return found.screen;
  if (path === "/login") return "Login";
  return path;
}

export function classifyAccess(
  profile: PersonProfile,
  path: string
): { actor: SentinelaActor; reason: string } {
  const entry = screenAccessMatrix.find((s) => s.path === path);
  if (!entry) {
    return { actor: "autorizado", reason: "Rota pública da plataforma" };
  }
  const level = entry.access[profile];
  if (level === "—") {
    return {
      actor: "bloqueado",
      reason: `Perfil ${profileLabels[profile]} não tem acesso a ${entry.screen} — sinalizado para auditoria`,
    };
  }
  return {
    actor: "autorizado",
    reason: level === "edita" ? `Perfil ${profileLabels[profile]} edita ${entry.screen}` : `Perfil ${profileLabels[profile]} visualiza ${entry.screen}`,
  };
}

export { screenLabelFor };

// Histórico inicial — popula o painel na primeira visita, num mês fictício
// anterior ao uso real da sessão. Mistura acessos legítimos com tentativas
// fora do perfil (o equivalente, aqui, ao tráfego de bot/scanner do modelo
// original: origem sem a permissão adequada para a tela).
const SEED_ACTORS: { id: string; name: string; profile: PersonProfile }[] = [
  { id: "p-diretoria-1", name: "Renato Kappel", profile: "diretoria" },
  { id: "p-pmo-1", name: "Diego Bortolin", profile: "pmo" },
  { id: "p-area-2", name: "Fábio Guariento", profile: "area" },
  { id: "p-controladoria-1", name: "Simone Ravanelli", profile: "controladoria" },
  { id: "p-exec-01", name: "Rafael Andreatta", profile: "executor" },
  { id: "p-exec-09", name: "Felipe Ortolan", profile: "executor" },
];

const SEED_PLAN: { actorIndex: number; path: string; hoursAgo: number }[] = [
  { actorIndex: 0, path: "/", hoursAgo: 96 },
  { actorIndex: 0, path: "/parametrizacao", hoursAgo: 95 },
  { actorIndex: 1, path: "/priorizacao", hoursAgo: 90 },
  { actorIndex: 1, path: "/maturidade", hoursAgo: 89 },
  { actorIndex: 2, path: "/execucao", hoursAgo: 72 },
  { actorIndex: 2, path: "/parametrizacao", hoursAgo: 71.8 }, // fora do perfil
  { actorIndex: 3, path: "/", hoursAgo: 60 },
  { actorIndex: 3, path: "/perfis", hoursAgo: 59.5 }, // fora do perfil
  { actorIndex: 4, path: "/colaborador", hoursAgo: 48 },
  { actorIndex: 4, path: "/execucao", hoursAgo: 47.9 },
  { actorIndex: 5, path: "/colaborador", hoursAgo: 30 },
  { actorIndex: 5, path: "/parametrizacao", hoursAgo: 29.9 }, // fora do perfil
  { actorIndex: 1, path: "/execucao", hoursAgo: 20 },
  { actorIndex: 0, path: "/perfis", hoursAgo: 6 },
  { actorIndex: 2, path: "/priorizacao", hoursAgo: 3 },
];

export function buildSeedEvents(): SentinelaEvent[] {
  const now = Date.now();
  return SEED_PLAN.map((entry, i) => {
    const actor = SEED_ACTORS[entry.actorIndex];
    const { actor: classification, reason } = classifyAccess(actor.profile, entry.path);
    return {
      id: `seed-${i}`,
      timestamp: new Date(now - entry.hoursAgo * 60 * 60 * 1000).toISOString(),
      personaId: actor.id,
      personaName: actor.name,
      profile: actor.profile,
      screen: entry.path,
      screenLabel: screenLabelFor(entry.path),
      actor: classification,
      kind: "navegacao",
      reason,
    };
  });
}
