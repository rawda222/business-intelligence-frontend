"use client";

import { apiGet, apiPost } from "./client";
import type {
  Business,
  BusinessListResponse,
  CreateBusinessRequest,
  PipelineResult,
} from "@/types";

export const businessesApi = {
  list: () => apiGet<BusinessListResponse>("/businesses"),

  get: (businessId: string) =>
    apiGet<Business>(`/businesses/${businessId}`),

  create: (body: CreateBusinessRequest) =>
    apiPost<Business>("/businesses", body),

  /** POST /businesses/{id}/pipeline/full — runs the full 9-stage pipeline. */
  runFullPipeline: (businessId: string) =>
    apiPost<PipelineResult>(`/businesses/${businessId}/pipeline/full`),

  /** POST /businesses/{id}/pipeline/upload — upload scraper JSON + start pipeline. */
  uploadReviews: (businessId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiPost<PipelineResult>(
      `/businesses/${businessId}/pipeline/upload`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
