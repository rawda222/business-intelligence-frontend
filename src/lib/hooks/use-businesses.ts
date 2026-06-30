"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { businessesApi } from "@/lib/api/businesses";
import type { CreateBusinessRequest } from "@/types";

export const businessKeys = {
  all: ["businesses"] as const,
  detail: (id: string) => ["businesses", id] as const,
};

export function useBusinesses() {
  return useQuery({
    queryKey: businessKeys.all,
    queryFn: () => businessesApi.list(),
    // ✅ Always refetch when component mounts
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
  });
}

export function useBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: businessKeys.detail(businessId ?? ""),
    queryFn: () => businessesApi.get(businessId!),
    enabled: !!businessId,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useCreateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBusinessRequest) => businessesApi.create(body),
    onSuccess: () => {
      // ✅ Invalidate AND refetch
      qc.invalidateQueries({ queryKey: businessKeys.all });
      qc.refetchQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useRunFullPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (businessId: string) => businessesApi.runFullPipeline(businessId),
    onSuccess: (_data, businessId) => {
      qc.invalidateQueries({ queryKey: businessKeys.all });
      qc.invalidateQueries({ queryKey: businessKeys.detail(businessId) });
      qc.refetchQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useUploadReviews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ businessId, file }: { businessId: string; file: File }) =>
      businessesApi.uploadReviews(businessId, file),
    onSuccess: (_data, { businessId }) => {
      qc.invalidateQueries({ queryKey: businessKeys.all });
      qc.invalidateQueries({ queryKey: businessKeys.detail(businessId) });
      qc.refetchQueries({ queryKey: businessKeys.all });
    },
  });
}