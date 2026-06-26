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
  });
}

export function useBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: businessKeys.detail(businessId ?? ""),
    queryFn: () => businessesApi.get(businessId!),
    enabled: !!businessId,
  });
}

export function useCreateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBusinessRequest) => businessesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.all }),
  });
}

export function useRunFullPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (businessId: string) => businessesApi.runFullPipeline(businessId),
    onSuccess: (_data, businessId) => {
      qc.invalidateQueries({ queryKey: businessKeys.all });
      qc.invalidateQueries({ queryKey: businessKeys.detail(businessId) });
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
    },
  });
}
