import { Menu, Search, Bell, ShieldCheck } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { useSentinelaStore } from "@/store/sentinelaStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PersonaSwitcher } from "@/components/layout/PersonaSwitcher";

export function Topbar() {
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const openSentinela = useSentinelaStore((s) => s.open);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-surface/90 px-5 backdrop-blur lg:px-8">
      <button
        aria-label="Abrir menu"
        onClick={() => setMobileNavOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="search"
          placeholder="Buscar projeto, código, responsável..."
          className="w-full rounded-md border border-border bg-app-alt py-2.5 pl-10 pr-3 text-[13px] text-text placeholder:text-text-tertiary outline-none transition-colors focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
        />
      </div>

      <div className="flex-1" />

      <button
        aria-label="Sentinela — auditoria de acessos"
        title="Sentinela — auditoria de acessos"
        onClick={openSentinela}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:border-primary hover:text-primary"
      >
        <ShieldCheck className="h-[18px] w-[18px]" />
      </button>

      <button
        aria-label="Notificações"
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:border-primary hover:text-primary"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-2 border-surface bg-primary" />
      </button>

      <ThemeToggle />
      <PersonaSwitcher />
    </header>
  );
}
