"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Grid3x3,
  Target,
  Megaphone,
  PlayCircle,
  UploadCloud,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useT } from "@/lib/i18n/i18n";
import { useUiStore } from "@/lib/stores/ui-store";
import {
  useBusiness,
  useRunFullPipeline,
  businessKeys,
} from "@/lib/hooks/use-businesses";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReportSkeleton } from "@/components/shared/skeletons";
import { PipelineTracker } from "@/components/shared/pipeline-tracker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { PipelineResult, ReportKind } from "@/types";

const businessTypeKey = (type: string): TranslationKey =>
  `businesses.type.${type}` as TranslationKey;

const REPORT_CARDS: {
  kind: ReportKind;
  icon: React.ComponentType<{ className?: string }>;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  ctaKey: TranslationKey;
  accent: string;
}[] = [
  {
    kind: "swot",
    icon: Grid3x3,
    titleKey: "swot.title",
    descKey: "swot.subtitle",
    ctaKey: "businesses.detail.openSwot",
    accent: "from-violet-500/20 to-violet-500/5 text-violet-500",
  },
  {
    kind: "strategy",
    icon: Target,
    titleKey: "strategy.title",
    descKey: "strategy.subtitle",
    ctaKey: "businesses.detail.openStrategy",
    accent: "from-indigo-500/20 to-indigo-500/5 text-indigo-500",
  },
  {
    kind: "campaigns",
    icon: Megaphone,
    titleKey: "campaigns.title",
    descKey: "campaigns.subtitle",
    ctaKey: "businesses.detail.openCampaigns",
    accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

export function BusinessDetailView() {
  const { t, locale } = useT();
  const { route, navigate } = useUiStore();
  const qc = useQueryClient();
  const businessId = route.businessId;

  const businessQ = useBusiness(businessId);
  const pipelineMut = useRunFullPipeline();
  const [pipelineRun, setPipelineRun] = useState<PipelineResult | undefined>(
    undefined,
  );

  if (!businessId) {
    return (
      <EmptyState
        icon={Building2}
        title={t("businesses.empty.title")}
        description={t("businesses.empty.desc")}
        action={{
          label: t("nav.businesses"),
          onClick: () => navigate({ view: "businesses" }),
        }}
      />
    );
  }

  if (businessQ.isLoading) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <ReportSkeleton />
        </motion.div>
      </motion.div>
    );
  }

  const business = businessQ.data;
  if (!business) {
    return (
      <EmptyState
        icon={Building2}
        title={t("businesses.empty.title")}
        description={t("businesses.empty.desc")}
        action={{
          label: t("nav.businesses"),
          onClick: () => navigate({ view: "businesses" }),
        }}
      />
    );
  }

  const runPipeline = async () => {
    try {
      const result = await pipelineMut.mutateAsync(businessId);
      setPipelineRun(result);
      toast.success(t("toast.pipelineStarted"), {
        description: business.name,
      });
    } catch {
      toast.error(t("toast.error"));
    }
  };

  const hasAny =
    business.has_swot || business.has_strategy || business.has_campaigns;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={business.name}
          subtitle={business.description}
          icon={Building2}
          meta={[
            {
              label: t("common.businessType"),
              value: t(businessTypeKey(business.business_type)),
            },
            {
              label: t("businesses.location"),
              value: business.location ?? "—",
            },
            {
              label: t("businesses.reviews"),
              value: business.review_count.toLocaleString(
                locale === "ar" ? "ar-EG" : "en-US",
              ),
            },
            {
              label: t("common.generatedAt"),
              value: formatRelative(business.created_at, locale),
            },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  navigate({ view: "upload", businessId: business.business_id })
                }
              >
                <UploadCloud className="h-4 w-4" />
                {t("businesses.detail.uploadFile")}
              </Button>
              <Button
                onClick={runPipeline}
                disabled={pipelineMut.isPending}
                className="rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
              >
                {pipelineMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                {t("businesses.detail.runPipeline")}
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Status banner */}
      <motion.div variants={itemVariants}>
        <Card className="flex flex-wrap items-center gap-3 rounded-2xl glass p-4">
          <span
            className={cn(
              "flex h-2 w-2 rounded-full",
              business.status === "active"
                ? "bg-emerald-500"
                : business.status === "processing"
                  ? "bg-amber-500"
                  : "bg-muted-foreground/50",
            )}
          />
          <span className="text-sm font-medium capitalize">
            {business.status}
          </span>
          <Badge
            variant="outline"
            className="rounded-lg bg-primary/5 text-[10px] font-medium"
          >
            {business.last_pipeline_run
              ? `${t("pipeline.title")} · ${formatRelative(
                  business.last_pipeline_run,
                  locale,
                )}`
              : `${t("pipeline.title")} · —`}
          </Badge>
          <div className="ms-auto flex items-center gap-3 text-[11px] text-muted-foreground">
            <ReportChip icon={Grid3x3} on={business.has_swot} label="SWOT" />
            <ReportChip icon={Target} on={business.has_strategy} label="Strategy" />
            <ReportChip icon={Megaphone} on={business.has_campaigns} label="Campaigns" />
          </div>
        </Card>
      </motion.div>

      {/* Pipeline tracker */}
      {pipelineRun && (
        <motion.div variants={itemVariants}>
          <PipelineTracker
            run={pipelineRun}
            onComplete={() => {
              toast.success(t("toast.pipelineDone"));
              qc.invalidateQueries({
                queryKey: businessKeys.detail(businessId),
              });
              qc.invalidateQueries({ queryKey: businessKeys.all });
            }}
          />
        </motion.div>
      )}

      {/* Reports */}
      <motion.div variants={itemVariants}>
        {hasAny ? (
          <div className="grid gap-4 md:grid-cols-3">
            {REPORT_CARDS.map((card) => {
              const available =
                card.kind === "swot"
                  ? business.has_swot
                  : card.kind === "strategy"
                    ? business.has_strategy
                    : business.has_campaigns;
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.kind}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="flex h-full flex-col gap-3 rounded-2xl glass p-5">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br",
                        card.accent,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{t(card.titleKey)}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {t(card.descKey)}
                      </p>
                    </div>
                    <div className="mt-auto pt-2">
                      {available ? (
                        <Button
                          onClick={() =>
                            navigate({
                              view: card.kind,
                              businessId: business.business_id,
                            })
                          }
                          className="w-full rounded-xl"
                          variant="default"
                        >
                          {t(card.ctaKey)}
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block w-full">
                              <Button
                                disabled
                                variant="outline"
                                className="w-full rounded-xl"
                              >
                                {t(card.ctaKey)}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            {t("businesses.detail.noReports")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title={t("businesses.detail.noReports")}
            description={t("swot.empty.desc")}
            action={{
              label: t("businesses.detail.runPipeline"),
              onClick: runPipeline,
            }}
          />
        )}
      </motion.div>

      {/* Back link */}
      <motion.div variants={itemVariants} className="flex justify-center pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ view: "businesses" })}
          className="gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("nav.businesses")}
        </Button>
      </motion.div>
    </motion.div>
  );
}

function ReportChip({
  icon: Icon,
  on,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  on: boolean;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          on ? "text-emerald-500" : "text-muted-foreground/40",
        )}
      />
      <span className={on ? "text-foreground" : "text-muted-foreground/60"}>
        {label}
      </span>
    </span>
  );
}
