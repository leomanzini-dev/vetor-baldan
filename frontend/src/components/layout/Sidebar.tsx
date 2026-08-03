import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { navGroups } from "@/config/navigation";
import { useUiStore } from "@/store/uiStore";
import baldanLogo from "@/assets/baldan-logo.png";

function EixoBadge({ eixo }: { eixo: 1 | 2 | 3 }) {
  return (
    <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-nav-text-muted">
      E{eixo}
    </span>
  );
}

export function Sidebar() {
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <>
      {mobileNavOpen && (
        <button
          aria-label="Fechar menu"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-nav transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-nav-border px-5 py-5">
          <div className="flex flex-col gap-2.5">
            <img src={baldanLogo} alt="Baldan" className="h-[19px] w-auto" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-[15px] font-bold tracking-[3px] text-nav-text">VETOR</span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-nav-text-muted">
                Portfólio de Inovação
              </span>
            </div>
          </div>
          <button
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
            className="text-nav-text-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-1">
              <div className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[1.5px] text-nav-text-muted">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `group relative mb-0.5 flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                        isActive
                          ? "bg-primary-soft/[0.14] text-white"
                          : "text-nav-text-muted hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />
                        )}
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.eixo && <EixoBadge eixo={item.eixo} />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-nav-border px-3 py-4">
          <NavLink
            to="/login"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium text-nav-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </NavLink>
        </div>
      </aside>
    </>
  );
}
