import type { ComponentType, ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  featured?: boolean;
  delta?: { value: string; positive: boolean };
  meta?: { label: string; value: string }[];
  footer?: ReactNode;
}

export function KpiCard({ label, value, icon: Icon, featured, delta, meta, footer }: KpiCardProps) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-card border p-5 shadow-token-sm transition-transform hover:-translate-y-0.5 ${
        featured
          ? "border-primary-soft bg-primary-soft/40 dark:bg-primary-soft"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            featured ? "bg-primary text-on-primary" : "bg-app-alt text-text-secondary"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>

      <div className="flex items-end gap-2.5">
        <span className="text-[28px] font-semibold leading-none tracking-tight text-text">{value}</span>
        {delta && (
          <span
            className={`mb-0.5 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
              delta.positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            }`}
          >
            {delta.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta.value}
          </span>
        )}
      </div>

      {meta && meta.length > 0 && (
        <div className="flex gap-5 border-t border-dashed border-border pt-3.5">
          {meta.map((m) => (
            <div key={m.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{m.label}</p>
              <p className="mt-0.5 text-[13px] font-semibold text-text">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {footer}
    </div>
  );
}
