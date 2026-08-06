import { CheckCircle2, AlertTriangle, OctagonAlert } from "lucide-react";

interface Props {
  onTrack: number;
  attention: number;
  critical: number;
}

export function HealthDistribution({ onTrack, attention, critical }: Props) {
  const total = onTrack + attention + critical || 1;
  const segments = [
    { key: "on-track", value: onTrack, label: "Em dia", icon: CheckCircle2, bar: "bg-success", text: "text-success" },
    { key: "attention", value: attention, label: "Atenção", icon: AlertTriangle, bar: "bg-warning", text: "text-warning" },
    { key: "critical", value: critical, label: "Crítico", icon: OctagonAlert, bar: "bg-danger", text: "text-danger" },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s) => (
          <div
            key={s.key}
            className={`${s.bar} h-full transition-all`}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <s.icon className={`h-4 w-4 shrink-0 ${s.text}`} />
            <div>
              <p className="text-[15px] font-semibold leading-none text-text">{s.value}</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
