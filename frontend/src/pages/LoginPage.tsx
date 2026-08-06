import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Crosshair, Layers3, Workflow } from "lucide-react";
import { usePeople } from "@/hooks/usePortfolio";
import { usePersonaStore } from "@/store/personaStore";
import { profileLabels } from "@/config/profiles";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import baldanLogo from "@/assets/baldan-logo.png";
import type { PersonProfile } from "@/types/domain";

const quickProfiles: PersonProfile[] = ["diretoria", "pmo", "area", "controladoria", "executor"];

const features = [
  {
    icon: Crosshair,
    title: "Priorização explicável",
    desc: "Critérios e pesos parametrizáveis, com o porquê de cada posição no ranking.",
  },
  {
    icon: Layers3,
    title: "Maturidade sob medida",
    desc: "Escala TRL adaptada à metalomecânica agrícola, redefinível pela liderança.",
  },
  {
    icon: Workflow,
    title: "Execução ponta a ponta",
    desc: "Cronograma, curva-S e pontos por capacidade, do gate à entrega.",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { data: people } = usePeople();
  const setActivePerson = usePersonaStore((s) => s.setActivePerson);

  function enterAs(personId: string, profile: PersonProfile) {
    setActivePerson(personId);
    navigate(profile === "executor" ? "/colaborador" : "/");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    navigate("/");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="fixed right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      {/* ══════ Painel de marca ══════ */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-nav px-14 py-12 lg:flex">
        <div className="bg-blueprint pointer-events-none absolute inset-0" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <img src={baldanLogo} alt="Baldan" className="h-6 w-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-lg"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[2px] text-primary">
            Governança de Portfólio de Inovação
          </span>
          <h1 className="mb-5 text-[42px] font-semibold leading-[1.08] tracking-tight text-white">
            Cada projeto aponta<br />
            para uma <span className="font-display text-primary">direção.</span>
          </h1>
          <p className="mb-10 text-[15px] leading-relaxed text-white/60">
            O VETOR centraliza priorização, maturidade tecnológica e execução dos ~180 projetos
            de inovação da Baldan numa única plataforma — com critérios totalmente
            parametrizáveis e apoio de inteligência artificial.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <f.icon className="h-4 w-4" />
                </span>
                <p className="text-[13px] font-semibold text-white">{f.title}</p>
                <p className="text-[12px] leading-snug text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative flex items-center justify-between text-[11px] text-white/35"
        >
          <span>4 verticais · Preparo de Solo · Plantio · Pulverização · Peças</span>
          <span className="font-mono tracking-wider">VETOR · BALDAN</span>
        </motion.div>
      </section>

      {/* ══════ Painel de autenticação ══════ */}
      <section className="flex items-center justify-center bg-app px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[420px] rounded-card border border-border bg-surface p-9 shadow-token-lg"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 items-center rounded-md bg-nav px-2.5">
              <img src={baldanLogo} alt="Baldan" className="h-4 w-auto" />
            </span>
            <span className="text-[15px] font-bold tracking-[2.5px] text-text">VETOR</span>
          </div>

          <h2 className="mb-1.5 text-[22px] font-semibold text-text">Acesse a plataforma</h2>
          <p className="mb-7 text-[13px] text-text-secondary">
            Protótipo de demonstração — dados mockados, sem autenticação real.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-text" htmlFor="email">
                E-MAIL CORPORATIVO
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="email"
                  type="email"
                  defaultValue="renato.kappel@baldan.com.br"
                  className="w-full rounded-md border border-border bg-app-alt py-3 pl-10 pr-3 text-[13.5px] text-text outline-none transition-colors focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-text" htmlFor="senha">
                SENHA
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  defaultValue="••••••••"
                  className="w-full rounded-md border border-border bg-app-alt py-3 pl-10 pr-10 text-[13.5px] text-text outline-none transition-colors focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-soft"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Mostrar senha"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-btn bg-primary py-3 text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[1.5px] text-text-tertiary">
            <span className="h-px flex-1 bg-border" />
            ou entre rápido como
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickProfiles.map((profile) => {
              const person = people?.find((p) => p.profile === profile);
              if (!person) return null;
              return (
                <button
                  key={profile}
                  onClick={() => enterAs(person.id, profile)}
                  className="rounded-full border border-border bg-app-alt px-3.5 py-1.5 text-[12px] font-semibold text-text-secondary transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
                >
                  {profileLabels[profile]}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-text-tertiary">
            Executor abre a versão mobile de campo, com as micro-etapas do dia.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
