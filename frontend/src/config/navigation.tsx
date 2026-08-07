import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Crosshair,
  Layers3,
  Workflow,
  FolderKanban,
  SlidersHorizontal,
  Users,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  ListChecks,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  eixo?: 1 | 2 | 3;
  moduleStatus: "live" | "upcoming";
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: "Visão Geral",
    items: [
      { label: "Painel Executivo", path: "/", icon: LayoutDashboard, moduleStatus: "upcoming" },
    ],
  },
  {
    title: "Governança da Inovação",
    items: [
      { label: "Priorização", path: "/priorizacao", icon: Crosshair, eixo: 1, moduleStatus: "upcoming" },
      { label: "Maturidade", path: "/maturidade", icon: Layers3, eixo: 2, moduleStatus: "upcoming" },
      { label: "Execução", path: "/execucao", icon: Workflow, eixo: 3, moduleStatus: "upcoming" },
    ],
  },
  {
    title: "Micro Etapas",
    items: [{ label: "Minhas Tarefas", path: "/colaborador", icon: ListChecks, moduleStatus: "upcoming" }],
  },
  {
    title: "Portfólio",
    items: [
      { label: "Projetos", path: "/projetos", icon: FolderKanban, moduleStatus: "upcoming" },
    ],
  },
  {
    title: "Inteligência",
    items: [
      { label: "VETOR IA", path: "/ia", icon: Sparkles, moduleStatus: "upcoming" },
      { label: "WhatsApp IA", path: "/whatsapp", icon: MessageCircle, moduleStatus: "upcoming" },
    ],
  },
  {
    title: "Administração",
    items: [
      { label: "Parametrização", path: "/parametrizacao", icon: SlidersHorizontal, moduleStatus: "upcoming" },
      { label: "Perfis & Acessos", path: "/perfis", icon: Users, moduleStatus: "upcoming" },
      { label: "Sentinela", path: "/sentinela", icon: ShieldCheck, moduleStatus: "upcoming" },
    ],
  },
];
