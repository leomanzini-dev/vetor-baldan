import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { usePeople } from "@/hooks/usePortfolio";
import { usePersonaStore } from "@/store/personaStore";
import { profileLabels } from "@/config/profiles";
import type { PersonProfile } from "@/types/domain";

const profileOrder: PersonProfile[] = ["diretoria", "pmo", "area", "controladoria", "executor"];

export function PersonaSwitcher() {
  const { data: people } = usePeople();
  const activePersonId = usePersonaStore((s) => s.activePersonId);
  const setActivePerson = usePersonaStore((s) => s.setActivePerson);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activePerson = people?.find((p) => p.id === activePersonId);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!activePerson) {
    return <div className="h-10 w-40 animate-pulse rounded-full bg-surface-soft" />;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition-colors hover:border-primary/40"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-on-primary">
          {activePerson.avatarInitials}
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[12.5px] font-semibold text-text">{activePerson.name}</span>
          <span className="text-[10.5px] text-text-tertiary">{profileLabels[activePerson.profile]}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-card border border-border bg-surface shadow-token-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              Simular visão como
            </p>
            <p className="mt-0.5 text-[11.5px] text-text-secondary">
              Cada perfil enxerga o portfólio sob uma lente diferente.
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {profileOrder.map((profile) => {
              const group = people?.filter((p) => p.profile === profile) ?? [];
              if (group.length === 0) return null;
              return (
                <div key={profile} className="px-2 py-1.5">
                  <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    {profileLabels[profile]}
                  </p>
                  {group.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePerson(p.id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-app-alt ${
                        p.id === activePersonId ? "bg-primary-soft" : ""
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-app-alt text-[11px] font-bold text-text-secondary">
                        {p.avatarInitials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-text">{p.name}</span>
                        <span className="block truncate text-[10.5px] text-text-tertiary">{p.role}</span>
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
