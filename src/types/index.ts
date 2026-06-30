/**
 * Backend contract types — mirror the FastAPI Pydantic models exactly.
 * Source of truth: the platform API spec.
 * Provider: Vertex AI Gemini 2.5 Flash. Agents: SWOT Agent, Strategy Agent.
 */

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: "owner" | "analyst" | "viewer";
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
}

/* ------------------------------------------------------------------ */
/* Business                                                            */
/* ------------------------------------------------------------------ */

export type BusinessStatus = "active" | "processing" | "draft";

export interface Business {
  business_id: string;
  name: string;
  business_type: string;
  description?: string;
  location?: string;
  review_count: number;
  status: BusinessStatus;
  has_swot: boolean;
  has_strategy: boolean;
  has_campaigns: boolean;
  created_at: string;
  updated_at: string;
  last_pipeline_run?: string;
}

export interface BusinessListResponse {
  businesses: Business[];
  total: number;
}

export interface CreateBusinessRequest {
  name: string;
  business_type: string;
  description?: string;
  location?: string;
}

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

/** The 9 real pipeline stages (requirement: pipeline progress tracker). */
export const PIPELINE_STAGES = [
  "queued",
  "uploading",
  "parsing",
  "themes",
  "swot",
  "strategy",
  "campaigns",
  "mongo",
  "done",
] as const;

export type PipelineStageName = (typeof PIPELINE_STAGES)[number];

export type StageStatus = "pending" | "running" | "completed" | "failed";

export interface PipelineStage {
  name: PipelineStageName;
  label: string;
  status: StageStatus;
  started_at?: string;
  completed_at?: string;
  detail?: string;
}

export type PipelineStatus = "queued" | "running" | "completed" | "failed";

export interface PipelineResult {
  business_id: string;
  run_id: string;
  status: PipelineStatus;
  current_stage: PipelineStageName;
  stages: PipelineStage[];
  started_at: string;
  completed_at?: string;
  report_ids?: {
    swot?: string;
    strategy?: string;
  };
  error?: string;
}

/* ------------------------------------------------------------------ */
/* SWOT Report                                                         */
/* ------------------------------------------------------------------ */

export interface Scoring {
  /** 0..1 importance */
  importance: number;
  /** 0..1 impact */
  impact: number;
  /** 0..1 confidence */
  confidence: number;
}

export type SwotQuadrant = "strengths" | "weaknesses" | "opportunities" | "threats";

export interface SWOTItem {
  item_id: string;
  title: string;
  reasoning: string;
  source_theme: string;
  scoring: Scoring;
  /** Real review quotes (Arabic + English mixed). */
  evidence_refs: string[];
  frequency: number;
}

export interface StrategicSummary {
  main_advantage: string;
  most_critical_risk: string;
  best_growth_opportunity: string;
}

export interface ReportMeta {
  llm_provider_used: string;
  llm_model_used: string;
  fallback_used: boolean;
  processing_time_ms: number;
  cost_estimate_usd: number;
}

export interface SWOTReport {
  business_type: string;
  engine_version: string;
  swot_report: Record<SwotQuadrant, SWOTItem[]>;
  strategic_summary: StrategicSummary;
  meta: ReportMeta;
}

/** Envelope: SWOT report persisted to MongoDB with an _id (requirement #10). */
export interface SWOTReportEnvelope extends SWOTReport {
  report_id: string;
  business_id: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Strategy Report                                                     */
/* ------------------------------------------------------------------ */

export type TOWSCategory = "SO" | "ST" | "WO" | "WT";

export interface TOWSStrategy {
  strategy_id: string;
  category: TOWSCategory;
  title: string;
  description: string;
  leverages: string[];
  effort: number; // 1..10
  impact: number; // 1..10
  time_horizon: string;
  confidence: number; // 0..1
}

export type PriorityRank = "P0" | "P1" | "P2" | "P3";

export interface PriorityAction {
  action_id: string;
  title: string;
  description: string;
  priority: PriorityRank;
  owner: string;
  effort: number; // 1..10
  impact: number; // 1..10
  timeframe: string;
  kpi: string;
  dependencies: string[];
}

export type ResourceGap = "low" | "medium" | "high";

export interface ResourceItem {
  resource_id: string;
  resource_type: "human" | "capital" | "technology" | "data" | "brand";
  name: string;
  current_state: string;
  required_state: string;
  gap: ResourceGap;
  estimated_cost_usd: number;
}

export interface CampaignBrief {
  feed_id: string;
  source_strategy_id: string;
  campaign_angle: string;
  messaging_pillar: string;
  channel_suitability: string[];
  confidence: string;
  requires_human_approval: boolean;
}

export interface StrategyReport {
  business_type: string;
  strategic_posture: string;
  posture_rationale: string;
  tows_matrix: Record<TOWSCategory, TOWSStrategy[]>;
  priority_action_plan: PriorityAction[];
  resource_assessment: ResourceItem[];
  campaign_brief_feed: CampaignBrief[];
}

export interface StrategyReportEnvelope extends StrategyReport {
  report_id: string;
  business_id: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Campaigns Report                                                    */
/* ------------------------------------------------------------------ */

export interface CampaignsReportEnvelope {
  report_id: string;
  business_id: string;
  created_at: string;
  business_type: string;
  engine_version: string;
  campaigns: CampaignBrief[];
  meta: ReportMeta;
}

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

export type ReportKind = "swot" | "strategy" | "campaigns";

export interface HistoryEntry {
  report_id: string;
  business_id: string;
  business_name: string;
  business_type: string;
  kind: ReportKind;
  engine_version: string;
  llm_model_used: string;
  fallback_used: boolean;
  processing_time_ms: number;
  cost_estimate_usd: number;
  created_at: string;
}
