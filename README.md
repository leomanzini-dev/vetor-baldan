# VETOR — Governança Estratégica de Portfólio de Inovação (Baldan)

Protótipo de front-end para o desafio tecnológico da Baldan. Centraliza priorização,
maturidade tecnológica (TRL) e execução ponta a ponta dos ~180 projetos de inovação da
companhia, com critérios totalmente parametrizáveis e apoio de IA. Todos os dados são
mock/fixture, gerados de forma determinística — não há banco de dados nem autenticação real.

## Stack

- **backend/** — Node.js + Express + TypeScript. Serve os dados mockados via REST
  (`/api/*`), gerados em memória a cada subida do processo. Sem persistência.
- **frontend/** — React + TypeScript + Vite, Tailwind CSS v4 (tokens do design system
  Baldan), React Router, TanStack Query, Recharts, Framer Motion, Zustand.

## Rodando o projeto

```bash
npm run install:all   # instala backend e frontend
npm run dev            # sobe os dois servidores juntos
```

- Frontend: http://localhost:5173
- API mock: http://localhost:4000/api

Ou individualmente: `npm run dev --prefix backend` / `npm run dev --prefix frontend`.

## Estrutura

```
backend/src/
  types/domain.ts        modelo de domínio (Project, Person, Vertical, TRL...)
  data/                   fixtures e gerador determinístico do portfólio (180 projetos)
  services/, controllers/, routes/   API REST

frontend/src/
  components/layout/      AppShell, Sidebar, Topbar, PersonaSwitcher
  components/ui/          primitivos de interface
  pages/                  telas por módulo
  store/                  tema, persona ativa, UI (Zustand)
  hooks/, lib/, types/     integração com a API, formatação, tipos
```

## Progresso por módulo

Desenvolvimento sequencial, um módulo por vez (ver `projeto.md`):

- [x] **Módulo 0** — Fundação: identidade visual (VETOR), navegação, layout, dados mock base
- [x] **Módulo 1** — Painel executivo
- [x] **Módulo 2** — Eixo 1: Priorização multicritério
- [x] **Módulo 3** — Eixo 2: Maturidade & Roadmap
- [x] **Módulo 4** — Eixo 3: Execução ponta a ponta
- [x] **Módulo 5** — Transversais: submissão de projetos, perfis, parametrização geral
