import { Sparkles, OctagonAlert, AlertTriangle } from "lucide-react";
import type { AiSignal } from "@/lib/aiSignals";

export function AiSignalsPanel({ signals }: { signals: AiSignal[] }) {
  if (signals.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-text-tertiary">
        Nenhum sinal de atenção no momento — portfólio dentro do esperado.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {signals.map((signal) => {
        const Icon = signal.severity === "critical" ? OctagonAlert : AlertTriangle;
        return (
          <li
            key={signal.id}
            className="flex gap-3 rounded-md border border-border bg-app-alt/60 p-3.5"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                signal.severity === "critical" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="text-[12.5px] leading-relaxed text-text-secondary">{signal.message}</p>
          </li>
        );
      })}
      <li className="flex items-center gap-1.5 pt-1 text-[10.5px] font-medium text-text-tertiary">
        <Sparkles className="h-3 w-3 text-primary" />
        Sinais gerados por análise interpretativa de IA sobre os dados do portfólio
      </li>
    </ul>
  );
}
