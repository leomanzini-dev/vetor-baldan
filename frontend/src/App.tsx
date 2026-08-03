import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PriorizacaoPage } from "@/pages/PriorizacaoPage";
import { MaturidadePage } from "@/pages/MaturidadePage";
import { ExecucaoPage } from "@/pages/ExecucaoPage";
import { ProjetosPage } from "@/pages/ProjetosPage";
import { ParametrizacaoPage } from "@/pages/ParametrizacaoPage";
import { PerfisPage } from "@/pages/PerfisPage";

function useSyncTheme() {
  const mode = useThemeStore((s) => s.mode);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);
}

export default function App() {
  useSyncTheme();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/priorizacao" element={<PriorizacaoPage />} />
        <Route path="/maturidade" element={<MaturidadePage />} />
        <Route path="/execucao" element={<ExecucaoPage />} />
        <Route path="/projetos" element={<ProjetosPage />} />
        <Route path="/parametrizacao" element={<ParametrizacaoPage />} />
        <Route path="/perfis" element={<PerfisPage />} />
      </Route>
    </Routes>
  );
}
