"use client";

import { motion } from "framer-motion";
import { Grid3x3, AlertTriangle, Sparkles, FileDown, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/i18n";
import { useUiStore } from "@/lib/stores/ui-store";
import { useBusiness } from "@/lib/hooks/use-businesses";
import { useSwotReport } from "@/lib/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReportSkeleton } from "@/components/shared/skeletons";
import {
  formatMs,
  formatDate,
  formatCurrency,
} from "@/lib/utils/format";
import {
  exportReportToPDF,
  escapeHtml,
} from "@/lib/utils/pdf-export";
import { cn } from "@/lib/utils";
import type { SwotQuadrant, SWOTItem } from "@/types";
import SwotQuadrantPanel from "@/components/swot/swot-quadrant";

const QUADRANT_ORDER: SwotQuadrant[] = [
  "strengths",
  "weaknesses",
  "opportunities",
  "threats",
];

const QUADRANT_TITLE_KEYS = {
  strengths: "swot.strengths",
  weaknesses: "swot.weaknesses",
  opportunities: "swot.opportunities",
  threats: "swot.threats",
} as const;

interface SummaryCardTheme {
  icon: LucideIcon;
  labelKey:
    | "swot.summary.mainAdvantage"
    | "swot.summary.criticalRisk"
    | "swot.summary.bestOpportunity";
  /** Logical left accent border (border-s-*). */
  accent: string;
  /** Icon square background tint. */
  iconWrap: string;
  /** Icon glyph tint. */
  iconColor: string;
}

const SUMMARY_CARDS: SummaryCardTheme[] = [
  {
    icon: Grid3x3,
    labelKey: "swot.summary.mainAdvantage",
    accent: "border-s-emerald-500/70",
    iconWrap: "bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: AlertTriangle,
    labelKey: "swot.summary.criticalRisk",
    accent: "border-s-rose-500/70",
    iconWrap: "bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Sparkles,
    labelKey: "swot.summary.bestOpportunity",
    accent: "border-s-violet-500/70",
    iconWrap: "bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

/** SWOT report view — pulled from `useSwotReport(businessId)`. */
export default function SwotReportView() {
  const { t, locale } = useT();
  const navigate = useUiStore((s) => s.navigate);
  const businessId = useUiStore((s) => s.route.businessId);

  const { data: report, isLoading, isError } = useSwotReport(businessId);
  const { data: business } = useBusiness(businessId);
  const businessName = business?.name ?? "—";

  /* ---------- Loading / error / empty states ---------- */
  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (isError || !report) {
    return (
      <EmptyState
        icon={Grid3x3}
        title={t("swot.empty.title")}
        description={t("swot.empty.desc")}
        action={{
          label: t("businesses.detail.runPipeline"),
          onClick: () =>
            navigate({ view: "business-detail", businessId: businessId ?? "" }),
        }}
      />
    );
  }

  /* ---------- PDF export ---------- */
  const handleExport = () => {
    const sections = QUADRANT_ORDER.map((q) => {
      const items: SWOTItem[] = report.swot_report[q] ?? [];
      const heading = t(QUADRANT_TITLE_KEYS[q]);
      const cardsHtml = items
        .map((item) => {
          const quotesHtml = item.evidence_refs
            .map(
              (qr) =>
                `<div class="quote">${escapeHtml(qr)}</div>`,
            )
            .join("");
          return `<div class="card">
            <span class="tag">${escapeHtml(item.source_theme)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.reasoning)}</p>
            ${quotesHtml}
          </div>`;
        })
        .join("");
      return {
        heading,
        html: `<div class="grid">${cardsHtml}</div>`,
      };
    });

    exportReportToPDF({
      title: `${businessName} — ${t("swot.title")}`,
      subtitle: report.strategic_summary.main_advantage,
      meta: [
        { label: t("common.reportId"), value: report.report_id },
        { label: t("common.businessType"), value: report.business_type },
        { label: t("common.engineVersion"), value: report.engine_version },
        { label: t("common.model"), value: report.meta.llm_model_used },
        {
          label: t("common.processingTime"),
          value: formatMs(report.meta.processing_time_ms, locale),
        },
        {
          label: t("common.cost"),
          value: formatCurrency(report.meta.cost_estimate_usd),
        },
        {
          label: t("common.generatedAt"),
          value: formatDate(report.created_at, locale),
        },
      ],
      sections,
    });

    toast.success(t("toast.exported"));
  };

  /* ---------- Meta + actions for PageHeader ---------- */
  const meta = [
    { label: t("common.reportId"), value: report.report_id },
    { label: t("common.businessType"), value: report.business_type },
    { label: t("common.engineVersion"), value: report.engine_version },
    { label: t("common.model"), value: report.meta.llm_model_used },
    {
      label: t("common.processingTime"),
      value: formatMs(report.meta.processing_time_ms, locale),
    },
    {
      label: t("common.cost"),
      value: formatCurrency(report.meta.cost_estimate_usd),
    },
    {
      label: t("common.generatedAt"),
      value: formatDate(report.created_at, locale),
    },
  ];

  const summaryEntries: { theme: SummaryCardTheme; text: string }[] = [
    {
      theme: SUMMARY_CARDS[0],
      text: report.strategic_summary.main_advantage,
    },
    {
      theme: SUMMARY_CARDS[1],
      text: report.strategic_summary.most_critical_risk,
    },
    {
      theme: SUMMARY_CARDS[2],
      text: report.strategic_summary.best_growth_opportunity,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("swot.title")}
        subtitle={t("swot.subtitle")}
        icon={Grid3x3}
        meta={meta}
        actions={
          <div className="flex items-center gap-2">
            {report.meta.fallback_used && (
              <Badge
                variant="outline"
                className="gap-1 rounded-lg bg-rose-500/15 px-2 py-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 border-rose-500/30"
              >
                <AlertTriangle className="h-3 w-3" />
                {t("common.fallbackUsed")}
              </Badge>
            )}
            <Button onClick={handleExport} className="rounded-xl">
              <FileDown className="h-4 w-4" />
              {t("common.export")}
            </Button>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        {/* Strategic summary */}
        <section aria-label={t("swot.summary")} className="grid gap-4 md:grid-cols-3">
          {summaryEntries.map(({ theme, text }) => {
            const Icon = theme.icon;
            return (
              <motion.div
                key={theme.labelKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={cn(
                  "rounded-2xl glass p-4 border-s-2",
                  theme.accent,
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      theme.iconWrap,
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", theme.iconColor)} />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t(theme.labelKey)}
                  </span>
                </div>
                <p dir="auto" className="text-sm leading-relaxed text-foreground/90">
                  {text}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* SWOT grid (2×2 on lg) */}
        <section className="grid gap-4 lg:grid-cols-2">
          {QUADRANT_ORDER.map((q) => (
            <SwotQuadrantPanel
              key={q}
              quadrant={q}
              items={report.swot_report[q] ?? []}
            />
          ))}
        </section>
      </motion.div>
    </div>
  );
}
