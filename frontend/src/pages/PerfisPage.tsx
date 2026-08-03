import { Crown, ClipboardList, Users2, Calculator, Wrench } from "lucide-react";
import { usePeople } from "@/hooks/usePortfolio";
import { Panel } from "@/components/ui/Panel";
import { profileLabels } from "@/config/profiles";
import { profileCapabilities, screenAccessMatrix, type AccessLevel } from "@/config/permissions";
import type { PersonProfile } from "@/types/domain";

const profileOrder: PersonProfile[] = ["diretoria", "pmo", "area", "controladoria", "executor"];

const profileIcons: Record<PersonProfile, typeof Crown> = {
  diretoria: Crown,
  pmo: ClipboardList,
  area: Users2,
  controladoria: Calculator,
  executor: Wrench,
};

const accessClasses: Record<AccessLevel, string> = {
  edita: "bg-primary-soft text-primary",
  visualiza: "bg-info-soft text-info",
  "—": "bg-app-alt text-text-tertiary",
};

export function PerfisPage() {
  const { data: people } = usePeople();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">Perfis &amp; Acessos</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          O que cada perfil enxerga e faz dentro do VETOR — da visão executiva de Diretoria ao dia a dia de quem
          executa micro-etapas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {profileOrder.map((profile) => {
          const Icon = profileIcons[profile];
          const members = people?.filter((p) => p.profile === profile) ?? [];
          return (
            <div key={profile} className="flex flex-col gap-3.5 rounded-card border border-border bg-surface p-5 shadow-token-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="rounded-full bg-app-alt px-2.5 py-1 text-[11px] font-bold text-text-secondary">
                  {members.length} pessoa{members.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-[15px] font-semibold text-text">{profileLabels[profile]}</p>
              <ul className="flex flex-col gap-1.5">
                {profileCapabilities[profile].map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-[12px] leading-snug text-text-secondary">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {cap}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border pt-3">
                {members.slice(0, 8).map((m) => (
                  <span
                    key={m.id}
                    title={m.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-app-alt text-[10px] font-bold text-text-secondary"
                  >
                    {m.avatarInitials}
                  </span>
                ))}
                {members.length > 8 && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-app-alt text-[10px] font-bold text-text-tertiary">
                    +{members.length - 8}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Panel title="Matriz de Acesso por Tela" subtitle="Mock — a distinção é visual e de navegação, sem enforcement real de permissão">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2.5 pr-3 font-semibold text-text-tertiary">Tela</th>
                {profileOrder.map((p) => (
                  <th key={p} className="px-2 py-2.5 text-center font-semibold text-text-tertiary">
                    {profileLabels[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {screenAccessMatrix.map((row) => (
                <tr key={row.screen} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-text">{row.screen}</td>
                  {profileOrder.map((p) => (
                    <td key={p} className="px-2 py-2.5 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold ${accessClasses[row.access[p]]}`}>
                        {row.access[p]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
