import { useQuery } from "@tanstack/react-query";
import { api, type ProjectListParams } from "@/lib/api";

export function usePeople() {
  return useQuery({ queryKey: ["people"], queryFn: api.getPeople, staleTime: Infinity });
}

export function useVerticals() {
  return useQuery({ queryKey: ["verticals"], queryFn: api.getVerticals, staleTime: Infinity });
}

export function useProjectTypes() {
  return useQuery({ queryKey: ["project-types"], queryFn: api.getProjectTypes, staleTime: Infinity });
}

export function useFunnelStages() {
  return useQuery({ queryKey: ["funnel-stages"], queryFn: api.getFunnelStages, staleTime: Infinity });
}

export function usePlatformParameters() {
  return useQuery({ queryKey: ["parameters"], queryFn: api.getParameters, staleTime: Infinity });
}

export function usePortfolioSummary() {
  return useQuery({ queryKey: ["portfolio-summary"], queryFn: api.getSummary });
}

export function usePortfolioHighlights() {
  return useQuery({ queryKey: ["portfolio-highlights"], queryFn: api.getHighlights });
}

export function useProjects(params: ProjectListParams = {}) {
  return useQuery({ queryKey: ["projects", params], queryFn: () => api.getProjects(params) });
}

export function useExecutingProjects() {
  return useQuery({ queryKey: ["execution-projects"], queryFn: api.getExecutingProjects });
}

export function useExecutionDetail(projectId: string | null) {
  return useQuery({
    queryKey: ["execution-detail", projectId],
    queryFn: () => api.getExecutionDetail(projectId as string),
    enabled: !!projectId,
  });
}

export function useCapacitySummary() {
  return useQuery({ queryKey: ["capacity-summary"], queryFn: api.getCapacitySummary });
}

export function usePortfolioScurve() {
  return useQuery({ queryKey: ["portfolio-scurve"], queryFn: api.getPortfolioScurve });
}

export function useMonthlyTrend() {
  return useQuery({ queryKey: ["monthly-trend"], queryFn: api.getMonthlyTrend });
}
