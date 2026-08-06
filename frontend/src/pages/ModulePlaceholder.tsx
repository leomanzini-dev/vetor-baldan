import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ComponentType } from "react";

interface ModulePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  icon: ComponentType<{ className?: string }>;
}

export function ModulePlaceholder({ eyebrow, title, description, bullets, icon: Icon }: ModulePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-soft bg-primary-soft text-primary">
        <Icon className="h-7 w-7" />
      </div>

      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[1.5px] text-text-tertiary">
        <Sparkles className="h-3 w-3 text-primary" />
        {eyebrow}
      </span>

      <h1 className="mb-3 text-[30px] font-semibold leading-tight tracking-tight text-text">
        {title}
      </h1>
      <p className="mb-8 text-[15px] leading-relaxed text-text-secondary">{description}</p>

      <div className="w-full rounded-card border border-border bg-surface p-6 text-left shadow-token-sm">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
          Este módulo vai trazer
        </p>
        <ul className="space-y-2.5">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
