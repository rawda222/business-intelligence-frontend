"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";

export const reportKeys = {
  swot: (id: string) => ["reports", "swot", id] as const,
  strategy: (id: string) => ["reports", "strategy", id] as const,
  campaigns: (id: string) => ["reports", "campaigns", id] as const,
  history: ["reports", "history"] as const,
};

// Helper: get last pipeline result from localStorage
function getLastPipelineResult(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("lastPipelineResult");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Build a SWOT report from pipeline response
function buildSwotReport(data: any, businessId: string): any {
  if (!data?.swot) return null;
  
  const swot = data.swot;
  return {
    report_id: data.persisted?.swot_report_id || "swot_" + businessId,
    business_id: businessId,
    business_type: swot.business_type || "cafe",
    engine_version: swot.engine_version || "7.0",
    created_at: new Date().toISOString(),
    swot_report: {
      strengths: (swot.swot_report?.strengths || []).map((item: any) => ({
        item_id: item.item_id,
        title: item.title,
        reasoning: item.reasoning,
        source_theme: item.source_theme,
        scoring: {
          importance: item.scoring?.importance || 5,
          impact: item.scoring?.impact || 5,
          confidence: item.scoring?.confidence || 0.5,
        },
        evidence_refs: item.evidence_refs || [],
        frequency: item.evidence_summary?.source_frequency || 1,
      })),
      weaknesses: (swot.swot_report?.weaknesses || []).map((item: any) => ({
        item_id: item.item_id,
        title: item.title,
        reasoning: item.reasoning,
        source_theme: item.source_theme,
        scoring: {
          importance: item.scoring?.importance || 5,
          impact: item.scoring?.impact || 5,
          confidence: item.scoring?.confidence || 0.5,
        },
        evidence_refs: item.evidence_refs || [],
        frequency: item.evidence_summary?.source_frequency || 1,
      })),
      opportunities: (swot.swot_report?.opportunities || []).map((item: any) => ({
        item_id: item.item_id,
        title: item.title,
        reasoning: item.reasoning,
        source_theme: item.source_theme,
        scoring: {
          importance: item.scoring?.importance || 5,
          impact: item.scoring?.impact || 5,
          confidence: item.scoring?.confidence || 0.5,
        },
        evidence_refs: item.evidence_refs || [],
        frequency: item.evidence_summary?.source_frequency || 1,
      })),
      threats: (swot.swot_report?.threats || []).map((item: any) => ({
        item_id: item.item_id,
        title: item.title,
        reasoning: item.reasoning,
        source_theme: item.source_theme,
        scoring: {
          importance: item.scoring?.importance || 5,
          impact: item.scoring?.impact || 5,
          confidence: item.scoring?.confidence || 0.5,
        },
        evidence_refs: item.evidence_refs || [],
        frequency: item.evidence_summary?.source_frequency || 1,
      })),
    },
    strategic_summary: {
      main_advantage: swot.strategic_summary?.main_advantage || "Analysis complete",
      most_critical_risk: swot.strategic_summary?.most_critical_risk || "Review recommended",
      best_growth_opportunity: swot.strategic_summary?.best_growth_opportunity || "Explore opportunities",
    },
    meta: {
      llm_provider_used: swot.meta?.llm_provider_used || "vertex_ai",
      llm_model_used: swot.meta?.llm_model_used || "gemini-2.5-flash",
      fallback_used: swot.meta?.fallback_used || false,
      processing_time_ms: swot.meta?.processing_time_ms || 0,
      cost_estimate_usd: swot.meta?.cost_estimate_usd || 0,
    },
  };
}

// Build a Strategy report from pipeline response
function buildStrategyReport(data: any, businessId: string): any {
  if (!data?.strategy) return null;
  
  const strategy = data.strategy;
  return {
    report_id: data.persisted?.strategy_report_id || "strategy_" + businessId,
    business_id: businessId,
    business_type: strategy.business_type || "cafe",
    strategic_posture: strategy.strategic_posture || "balanced",
    posture_rationale: strategy.posture_rationale || "",
    created_at: new Date().toISOString(),
    tows_matrix: {
      SO: strategy.tows_matrix?.SO || [],
      ST: strategy.tows_matrix?.ST || [],
      WO: strategy.tows_matrix?.WO || [],
      WT: strategy.tows_matrix?.WT || [],
    },
    priority_action_plan: strategy.priority_action_plan || [],
    resource_assessment: (strategy.resource_assessment || []).map((r: any, i: number) => {
  // Build current/required state from effort/impact/horizon
  const effortLabel = r.effort || r.estimated_effort || "medium";
  const impactLabel = r.impact || r.estimated_impact || "medium";
  const horizon = r.horizon || "short_term";
  
  // Estimate cost based on effort
  const costMap: any = { low: 5000, medium: 15000, high: 50000 };
  const estimatedCost = costMap[String(effortLabel).toLowerCase()] || 10000;
  
  return {
    ...r,
    resource_id: r.action_id || r.resource_id || `res_${i}`,
    resource_type: "capital",
    name: r.title || r.action_id || `Resource ${i + 1}`,
    current_state: `Currently ${effortLabel} effort needed`,
    required_state: `Target ${impactLabel} impact (${horizon.replace("_", " ")})`,
    gap: String(effortLabel).toLowerCase() === "high" ? "high" 
         : String(effortLabel).toLowerCase() === "low" ? "low" 
         : "medium",
    estimated_cost_usd: estimatedCost,
  };
}),
    campaign_brief_feed: strategy.campaign_brief_feed || [],
  };
}

// Build a Campaigns report from pipeline response
function buildCampaignsReport(data: any, businessId: string): any {
  if (!data?.strategy?.campaign_brief_feed) return null;
  
  return {
    report_id: "campaigns_" + businessId,
    business_id: businessId,
    business_type: data.swot?.business_type || "cafe",
    engine_version: "1.0",
    created_at: new Date().toISOString(),
    campaigns: data.strategy.campaign_brief_feed || [],
    meta: {
      llm_provider_used: "vertex_ai",
      llm_model_used: "gemini-2.5-flash",
      fallback_used: false,
      processing_time_ms: 0,
      cost_estimate_usd: 0,
    },
  };
}

export function useSwotReport(businessId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.swot(businessId ?? ""),
    queryFn: async () => {
      // ✅ First try localStorage (pipeline result)
      const lastResult = getLastPipelineResult();
      if (lastResult && businessId) {
        const report = buildSwotReport(lastResult, businessId);
        if (report) {
          console.log("[SwotReport] Using pipeline result from localStorage");
          return report;
        }
      }
      
      // Fallback to API
      try {
        return await reportsApi.swot(businessId!);
      } catch (e) {
        console.warn("[SwotReport] API failed, no data available");
        throw e;
      }
    },
    enabled: !!businessId,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useStrategyReport(businessId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.strategy(businessId ?? ""),
    queryFn: async () => {
      const lastResult = getLastPipelineResult();
      if (lastResult && businessId) {
        const report = buildStrategyReport(lastResult, businessId);
        if (report) {
          console.log("[StrategyReport] Using pipeline result from localStorage");
          return report;
        }
      }
      
      try {
        return await reportsApi.strategy(businessId!);
      } catch (e) {
        throw e;
      }
    },
    enabled: !!businessId,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useCampaignsReport(businessId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.campaigns(businessId ?? ""),
    queryFn: async () => {
      const lastResult = getLastPipelineResult();
      if (lastResult && businessId) {
        const report = buildCampaignsReport(lastResult, businessId);
        if (report) {
          console.log("[CampaignsReport] Using pipeline result from localStorage");
          return report;
        }
      }
      
      try {
        return await reportsApi.campaigns(businessId!);
      } catch (e) {
        throw e;
      }
    },
    enabled: !!businessId,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useHistory() {
  return useQuery({
    queryKey: reportKeys.history,
    queryFn: () => reportsApi.history(),
    retry: false,
  });
}