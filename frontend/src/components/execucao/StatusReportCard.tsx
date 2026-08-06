import { TrendingUp, TrendingDown, AlertCircle, ArrowRight } from "lucide-react";
import { formatIndex } from "@/lib/format";
import type { StatusReport } from "@/types/domain";

function IndexChip({ label, value }: { label: string; value: number }) {
  const good = value >= 0.97;
  const Icon = good ? TrendingUp : TrendingDown;
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
        good ? "border-success-soft bg-success-soft" : "border-danger-soft bg-danger-soft"
      }`}
    >
      <Icon className={`h-4 w-4 ${good ? "text-success" : "text-danger"}`} />
      <div>
        <p className="font-mono text-[15px] font-bold leading-none text-text">{formatIndex(value)}</p>
        <p className="text-[10px] uppercase tracking-wide text-text-tertiary">{label}</p>
      </div>
    </div>
  );
}

export function StatusReportCard({ report }: { report: StatusReport }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
          Status Report · {report.period}
        </p>
        <div className="flex gap-2">
          <IndexChip label="SPI" value={report.spi} />
          <IndexChip label="CPI" value={report.cpi} />
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-text-secondary">{report.summary}</p>

      <div className="flex gap-2.5 rounded-md border border-warning-soft bg-warning-soft/60 p-3">
        <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-warning">Riscos</p>
          <p className="mt-0.5 text-[12.5px] text-text-secondary">{report.risks}</p>
        </div>
      </div>

      <div className="flex gap-2.5 rounded-md border border-border bg-app-alt p-3">
        <ArrowRight className="h-4 w-4 shrink-0 text-text-tertiary" />
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-text-tertiary">Próximos Passos</p>
          <p className="mt-0.5 text-[12.5px] text-text-secondary">{report.nextSteps}</p>
        </div>
      </div>
    </div>
  );
}
