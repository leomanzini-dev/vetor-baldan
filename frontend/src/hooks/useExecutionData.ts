import { useMemo } from "react";
import { useCapacitySummary, useExecutionDetail } from "@/hooks/usePortfolio";
import { useMicroStagesStore } from "@/store/microStagesStore";
import { mergeCapacitySummary, mergeExecutionDetail } from "@/lib/microStages";

export function useMergedExecutionDetail(projectId: string | null) {
  const query = useExecutionDetail(projectId);
  const custom = useMicroStagesStore((s) => s.custom);
  const overrides = useMicroStagesStore((s) => s.statusOverrides);

  const data = useMemo(
    () => (query.data ? mergeExecutionDetail(query.data, custom, overrides) : undefined),
    [query.data, custom, overrides]
  );

  return { ...query, data };
}

export function useMergedCapacitySummary() {
  const query = useCapacitySummary();
  const custom = useMicroStagesStore((s) => s.custom);
  const overrides = useMicroStagesStore((s) => s.statusOverrides);

  const data = useMemo(
    () => (query.data ? mergeCapacitySummary(query.data, custom, overrides) : undefined),
    [query.data, custom, overrides]
  );

  return { ...query, data };
}
