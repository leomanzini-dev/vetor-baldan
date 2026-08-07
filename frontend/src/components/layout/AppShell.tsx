import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AiOrb } from "@/components/ai/AiOrb";
import { PageErrorBoundary } from "@/components/layout/PageErrorBoundary";

export function AppShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-app">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          {/* key={pathname} reseta o boundary a cada navegação — sem isso, um
              erro capturado numa página continuaria aparecendo mesmo depois
              de o usuário navegar para outra aba que funciona normalmente. */}
          <PageErrorBoundary key={location.pathname}>
            <Outlet />
          </PageErrorBoundary>
        </main>
      </div>
      <AiOrb />
    </div>
  );
}
