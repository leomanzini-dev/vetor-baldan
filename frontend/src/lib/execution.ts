import { parseLocalDate } from "@/lib/format";
import type { Project } from "@/types/domain";

export function timeProgressFraction(project: Project, now = new Date()): number {
  if (project.funnelStage === "encerrado") return 1;
  const start = parseLocalDate(project.startDate).getTime();
  const end = parseLocalDate(project.targetDate).getTime();
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (now.getTime() - start) / (end - start)));
}
