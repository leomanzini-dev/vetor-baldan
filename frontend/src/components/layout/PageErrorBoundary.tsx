import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Sem isto, um erro de render em qualquer página derruba a árvore inteira do
// React e deixa a tela em branco — sidebar, topbar e tudo mais somem junto,
// sem nenhuma pista do que aconteceu. Isolado aqui em volta do <Outlet/>
// (ver AppShell), só o conteúdo da página quebra; o resto do app continua
// utilizável e o usuário consegue navegar para sair do estado com erro.
export class PageErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[VETOR] Erro ao renderizar a página:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-border bg-surface px-6 py-16 text-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-text">Algo deu errado ao carregar esta página</p>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-text-tertiary">
              Tente novamente — se o problema continuar, navegue para outra aba pelo menu lateral.
            </p>
            {this.state.error.message && (
              <p className="mt-2.5 max-w-md rounded-md border border-border bg-app-alt px-3 py-2 text-left font-mono text-[11px] text-text-tertiary">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
