"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Filter, ShieldCheck, ShieldAlert } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/i18n";
import { useUiStore } from "@/lib/stores/ui-store";
import { useCampaignsReport } from "@/lib/hooks/use-reports";
import { useBusiness } from "@/lib/hooks/use-businesses";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReportSkeleton } from "@/components/shared/skeletons";
import CampaignBriefCard from "@/components/campaigns/campaign-brief-card";
import {
  formatCurrency,
  formatDate,
} from "@/lib/utils/format";
import type { CampaignBrief } from "@/types";

type ApprovalFilter = "all" | "auto" | "needs";
type ConfidenceFilter = "all" | "high" | "medium" | "low";

/** Normalize a confidence string to high/medium/low. */
function normalizeConfidence(c: string): ConfidenceFilter {
  const v = c.toLowerCase().trim();
  if (v === "high" || v === "medium" || v === "low") return v;
  const n = Number.parseFloat(v);
  if (!Number.isNaN(n)) {
    if (n >= 0.75 || n >= 75) return "high";
    if (n >= 0.5 || n >= 50) return "medium";
    return "low";
  }
  return "medium";
}

export function CampaignsView() {
  const { t, isRTL, locale } = useT();
  const businessId = useUiStore((s) => s.route.businessId);
  const navigate = useUiStore((s) => s.navigate);

  const { data: report, isLoading, isError } = useCampaignsReport(businessId);
  const { data: business } = useBusiness(businessId);

  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("all");
  const [confidenceFilter, setConfidenceFilter] =
    useState<ConfidenceFilter>("all");

  const allCampaigns: CampaignBrief[] = report?.campaigns ?? [];

  const filtered = useMemo(() => {
    return allCampaigns.filter((c) => {
      if (approvalFilter === "auto" && c.requires_human_approval) return false;
      if (approvalFilter === "needs" && !c.requires_human_approval)
        return false;
      if (confidenceFilter !== "all") {
        if (normalizeConfidence(c.confidence) !== confidenceFilter)
          return false;
      }
      return true;
    });
  }, [allCampaigns, approvalFilter, confidenceFilter]);

  // Loading state
  if (isLoading) return <ReportSkeleton />;

  // Error or empty
  if (isError || !report || allCampaigns.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title={t("campaigns.empty.title")}
        description={t("campaigns.empty.desc")}
        action={{
          label: t("businesses.detail.runPipeline"),
          onClick: () =>
            navigate({ view: "business-detail", businessId: businessId }),
        }}
      />
    );
  }

  const meta = [
    { label: t("common.reportId"), value: report.report_id },
    { label: t("common.businessType"), value: report.business_type },
    { label: t("common.engineVersion"), value: report.engine_version },
    { label: t("common.model"), value: report.meta.llm_model_used },
    {
      label: t("common.cost"),
      value: formatCurrency(report.meta.cost_estimate_usd),
    },
    {
      label: t("common.generatedAt"),
      value: formatDate(report.created_at, locale),
    },
  ];

  const subtitle = business
    ? `${business.name} · ${t("campaigns.subtitle")}`
    : t("campaigns.subtitle");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("campaigns.title")}
        subtitle={subtitle}
        icon={Megaphone}
        meta={meta}
      />

      {/* Filter bar */}
      <Card className="rounded-2xl glass p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Approval filter */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                {t("campaigns.filters.approval")}
              </span>
              <ToggleGroup
                type="single"
                value={approvalFilter}
                onValueChange={(v) =>
                  setApprovalFilter((v as ApprovalFilter) || "all")
                }
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <ToggleGroupItem
                  value="all"
                  aria-label={t("common.all")}
                  className="px-3 text-xs"
                >
                  {t("common.all")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="auto"
                  aria-label={t("campaigns.autoApproved")}
                  className="px-3 text-xs"
                >
                  {t("campaigns.autoApproved")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="needs"
                  aria-label={t("campaigns.needsApproval")}
                  className="px-3 text-xs"
                >
                  {t("campaigns.needsApproval")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Confidence filter */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Filter className="h-3 w-3" />
                {t("campaigns.filters.confidence")}
              </span>
              <ToggleGroup
                type="single"
                value={confidenceFilter}
                onValueChange={(v) =>
                  setConfidenceFilter((v as ConfidenceFilter) || "all")
                }
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <ToggleGroupItem
                  value="all"
                  aria-label={t("common.all")}
                  className="px-3 text-xs"
                >
                  {t("common.all")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="high"
                  aria-label={t("campaigns.confidence.high")}
                  className="px-3 text-xs"
                >
                  {t("campaigns.confidence.high")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="medium"
                  aria-label={t("campaigns.confidence.medium")}
                  className="px-3 text-xs"
                >
                  {t("campaigns.confidence.medium")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="low"
                  aria-label={t("campaigns.confidence.low")}
                  className="px-3 text-xs"
                >
                  {t("campaigns.confidence.low")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Count summary */}
          <div className="flex items-center gap-2">
            {approvalFilter !== "all" && (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  approvalFilter === "needs"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                )}
              >
                {approvalFilter === "needs" ? (
                  <ShieldAlert className="h-3 w-3" />
                ) : (
                  <ShieldCheck className="h-3 w-3" />
                )}
                {approvalFilter === "needs"
                  ? t("campaigns.needsApproval")
                  : t("campaigns.autoApproved")}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="rounded-full bg-muted/60 px-3 py-1 text-[11px] font-medium"
            >
              {t("campaigns.count", { count: filtered.length })}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Empty filter result */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={t("common.none")}
          description={t("campaigns.empty.desc")}
          action={{
            label: t("common.all"),
            onClick: () => {
              setApprovalFilter("all");
              setConfidenceFilter("all");
            },
          }}
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          className={cn(
            "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
            isRTL && "text-right",
          )}
        >
          {filtered.map((brief, idx) => (
            <motion.div
              key={`${brief.feed_id}-${idx}`}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
              }}
              className="h-full"
            >
              <CampaignBriefCard brief={brief} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default CampaignsView;
