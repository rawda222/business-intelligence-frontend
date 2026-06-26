"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";

export const reportKeys = {
  swot: (id: string) => ["reports", "swot", id] as const,
  strategy: (id: string) => ["reports", "strategy", id] as const,
  campaigns: (id: string) => ["reports", "campaigns", id] as const,
  history: ["reports", "history"] as const,
};

export function useSwotReport(businessId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.swot(businessId ?? ""),
    queryFn: () => reportsApi.swot(businessId!),
    enabled: !!businessId,
  });
}

export function useStrategyReport(businessId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.strategy(businessId ?? ""),
    queryFn: () => reportsApi.strategy(businessId!),
    enabled: !!businessId,
  });
}

export function useCampaignsReport(businessId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.campaigns(businessId ?? ""),
    queryFn: () => reportsApi.campaigns(businessId!),
    enabled: !!businessId,
  });
}

export function useHistory() {
  return useQuery({
    queryKey: reportKeys.history,
    queryFn: () => reportsApi.history(),
  });
}
