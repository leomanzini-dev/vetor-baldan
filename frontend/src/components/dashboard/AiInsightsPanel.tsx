import { motion } from "framer-motion";
import { OctagonAlert, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import type { AiSignal } from "@/lib/aiSignals";

const severityStyle = {
  critical: { icon: OctagonAlert, bar: "bg-danger", chip: "bg-danger-soft text-danger" },
  attention: { icon: AlertTriangle, bar: "bg-warning", chip: "bg-warning-soft text-warning" },
  opportunity: { icon: TrendingUp, bar: "bg-success", chip: "bg-success-soft text-success" },
} as const;

export function AiInsightsPanel({ signals }: { signals: AiSignal[] }) {
  if (signals.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-text-tertiary">
        Nenhum sinal de atenção no momento — portfólio dentro do esperado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {signals.map((signal, i) => {
          const style = severityStyle[signal.severity];
          const Icon = style.icon;
          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
              className="relative flex gap-3 overflow-hidden rounded-md border border-border bg-app-alt/60 p-3.5 pl-4"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.chip}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.chip}`}>
                  {signal.category}
                </span>
                <p className="text-[12.5px] leading-relaxed text-text-secondary">{signal.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <p className="flex items-center gap-1.5 pt-1 text-[10.5px] font-medium text-text-tertiary">
        <Sparkles className="h-3 w-3 text-primary" />
        Sinais gerados por análise interpretativa de IA sobre os dados do portfólio
      </p>
    </div>
  );
}
