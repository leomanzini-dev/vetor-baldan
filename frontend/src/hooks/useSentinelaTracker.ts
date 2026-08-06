import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { usePersonaStore } from "@/store/personaStore";
import { useSentinelaStore } from "@/store/sentinelaStore";
import { usePeople } from "@/hooks/usePortfolio";
import { classifyAccess, screenLabelFor } from "@/config/sentinela";
import type { PersonProfile } from "@/types/domain";

const TRACKED_PREFIXES = ["/", "/priorizacao", "/maturidade", "/execucao", "/projetos", "/parametrizacao", "/perfis", "/colaborador"];

// Instrumentação real: cada navegação e cada troca de persona nesta sessão
// vira um evento de fato (não é dado inventado) — classificado com a mesma
// matriz de permissões usada em Perfis & Acessos.
export function useSentinelaTracker() {
  const location = useLocation();
  const activePersonId = usePersonaStore((s) => s.activePersonId);
  const addEvent = useSentinelaStore((s) => s.addEvent);
  const { data: people } = usePeople();

  const lastLoggedRef = useRef<string>("");

  useEffect(() => {
    if (!people) return;
    const path = location.pathname;
    if (!TRACKED_PREFIXES.includes(path)) return;

    const person = people.find((p) => p.id === activePersonId);
    if (!person) return;

    const dedupeKey = `${activePersonId}:${path}`;
    if (lastLoggedRef.current === dedupeKey) return;
    lastLoggedRef.current = dedupeKey;

    const { actor, reason } = classifyAccess(person.profile, path);
    addEvent({
      id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      personaId: person.id,
      personaName: person.name,
      profile: person.profile as PersonProfile,
      screen: path,
      screenLabel: screenLabelFor(path),
      actor,
      kind: "navegacao",
      reason,
    });
  }, [location.pathname, activePersonId, people, addEvent]);
}
