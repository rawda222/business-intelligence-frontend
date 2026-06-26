"use client";

import { apiGet } from "./client";
import type {
  SWOTReportEnvelope,
  StrategyReportEnvelope,
  CampaignsReportEnvelope,
  HistoryEntry,
} from "@/types";

export const reportsApi = {
  swot: (businessId: string) =>
    apiGet<SWOTReportEnvelope>(`/businesses/${businessId}/reports/swot`),

  strategy: (businessId: string) =>
    apiGet<StrategyReportEnvelope>(`/businesses/${businessId}/reports/strategy`),

  campaigns: (businessId: string) =>
    apiGet<CampaignsReportEnvelope>(`/businesses/${businessId}/reports/campaigns`),

  history: () => apiGet<{ entries: HistoryEntry[]; total: number }>("/reports/history"),
};
