import { useCallback, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";
import { useSentinelaStore } from "@/store/sentinelaStore";
import { useSentinelaTracker } from "@/hooks/useSentinelaTracker";
import { AppShell } from "@/components/layout/AppShell";
import { SentinelaPanel } from "@/components/sentinela/SentinelaPanel";
import { SecurityPage } from "@/pages/Security/SecurityPage";
import { LoginPage } from "@/pages/LoginPage";
import { ColaboradorPage } from "@/pages/ColaboradorPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PriorizacaoPage } from "@/pages/PriorizacaoPage";
import { MaturidadePage } from "@/pages/MaturidadePage";
import { ExecucaoPage } from "@/pages/ExecucaoPage";
import { ProjetosPage } from "@/pages/ProjetosPage";
import { ParametrizacaoPage } from "@/pages/ParametrizacaoPage";
import { PerfisPage } from "@/pages/PerfisPage";
import { AiPage } from "@/pages/AiPage";
import { WhatsAppPage } from "@/pages/WhatsAppPage";

function useSyncTheme() {
  const mode = useThemeStore((s) => s.mode);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);
}

export default function App() {
  useSyncTheme();
  useSentinelaTracker();

  const location = useLocation();
  const navigate = useNavigate();
  const closeGuard = useCallback(() => navigate("/"), [navigate]);

  // O item "Sentinela" do menu lateral navega para /sentinela; como o painel
  // é um overlay global controlado por store (não uma rota própria), essa
  // rota só serve de gatilho: abre o painel ao entrar, e ao fechá-lo (X ou
  // Esc) devolve para "/" — mesmo padrão do Security Guard em /seguranca,
  // que continua acessível por URL direta mesmo sem link no menu.
  const sentinelaOpen = useSentinelaStore((s) => s.isOpen);
  const openSentinela = useSentinelaStore((s) => s.open);

  useEffect(() => {
    if (location.pathname === "/sentinela") openSentinela();
  }, [location.pathname, openSentinela]);

  useEffect(() => {
    if (!sentinelaOpen && location.pathname === "/sentinela") navigate("/");
  }, [sentinelaOpen, location.pathname, navigate]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/colaborador" element={<ColaboradorPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/priorizacao" element={<PriorizacaoPage />} />
          <Route path="/maturidade" element={<MaturidadePage />} />
          <Route path="/execucao" element={<ExecucaoPage />} />
          <Route path="/projetos" element={<ProjetosPage />} />
          <Route path="/parametrizacao" element={<ParametrizacaoPage />} />
          <Route path="/perfis" element={<PerfisPage />} />
          <Route path="/ia" element={<AiPage />} />
          <Route path="/whatsapp" element={<WhatsAppPage />} />
          <Route path="/sentinela" element={null} />
          <Route path="/seguranca" element={null} />
        </Route>
      </Routes>
      <SentinelaPanel />
      {location.pathname === "/seguranca" && <SecurityPage onClose={closeGuard} />}
    </>
  );
}
