"use client";

import { apiGet, apiPost } from "./client";
import type {
  Business,
  BusinessListResponse,
  CreateBusinessRequest,
  PipelineResult,
} from "@/types";

function normalizeBusiness(raw: any): Business {
  return {
    business_id: raw.id || raw.business_id || "",
    name: raw.name || "Unnamed Business",
    business_type: raw.business_type || "cafe",
    description: raw.description || "",
    location: raw.location || "",
    review_count: raw.review_count || 25,
    status: raw.is_active === false ? "draft" : "active",
    has_swot: raw.has_swot !== false,
    has_strategy: raw.has_strategy !== false,
    has_campaigns: raw.has_campaigns !== false,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
    last_pipeline_run: raw.last_pipeline_run,
  };
}

export const businessesApi = {
  list: async (): Promise<BusinessListResponse> => {
    try {
      console.log("[BusinessesAPI] Fetching businesses...");
      const result: any = await apiGet("/businesses");
      
      console.log("[BusinessesAPI] Raw response:", result);
      
      // Handle array response directly
      if (Array.isArray(result)) {
        const businesses = result.map(normalizeBusiness);
        console.log("[BusinessesAPI] Got", businesses.length, "businesses (array)");
        return { businesses, total: businesses.length };
      }
      
      if (result && typeof result === "object") {
        // Handle { businesses: [...] }
        if ("businesses" in result && Array.isArray(result.businesses)) {
          console.log("[BusinessesAPI] Got", result.businesses.length, "businesses (wrapped)");
          return {
            businesses: result.businesses.map(normalizeBusiness),
            total: result.total || result.businesses.length,
          };
        }
        // ✅ Handle { items: [...] } - Backend format!
        if ("items" in result && Array.isArray(result.items)) {
          console.log("[BusinessesAPI] Got", result.items.length, "businesses (items)");
          return {
            businesses: result.items.map(normalizeBusiness),
            total: result.total || result.items.length,
          };
        }
      }
      
      console.warn("[BusinessesAPI] Unknown response format");
      return { businesses: [], total: 0 };
    } catch (error: any) {
      console.error("[BusinessesAPI] Error:", error.message);
      return { businesses: [], total: 0 };
    }
  },

  get: async (businessId: string): Promise<Business> => {
    const result: any = await apiGet(`/businesses/${businessId}`);
    return normalizeBusiness(result);
  },

  create: async (body: CreateBusinessRequest): Promise<Business> => {
    const result: any = await apiPost("/businesses", body);
    return normalizeBusiness(result);
  },

  runFullPipeline: (businessId: string) =>
    apiPost<PipelineResult>(`/businesses/${businessId}/pipeline/full`),

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