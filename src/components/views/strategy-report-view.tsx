"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Compass,
  FileDown,
  Megaphone,
  ArrowRight,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/i18n";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useUiStore } from "@/lib/stores/ui-store";
import { useBusiness } from "@/lib/hooks/use-businesses";
import { useStrategyReport } from "@/lib/hooks/use-reports";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReportSkeleton } from "@/components/shared/skeletons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/utils/format";
import {
  escapeHtml,
  exportReportToPDF,
} from "@/lib/utils/pdf-export";
import { cn } from "@/lib/utils";
import TowsMatrix from "@/components/strategy/tows-matrix";
import PriorityRoadmap from "@/components/strategy/priority-roadmap";
import EffortImpactScatter from "@/components/strategy/effort-impact-scatter";
import ResourceAssessment from "@/components/strategy/resource-assessment";
import type {
  CampaignBrief,
  StrategyReportEnvelope,
  TOWSCategory,
  TOWSStrategy,
} from "@/types";

/** Confidence label → color token used for campaign brief feed chips. */
function confidenceClass(confidence: string): string {
  switch (confidence?.toLowerCase()) {
    case "high":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    case "medium":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    case "low":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

const TOWS_CATS: TOWSCategory[] = ["SO", "ST", "WO", "WT"];

const TOWS_LABEL_KEYS: Record<TOWSCategory, TranslationKey> = {
  SO: "strategy.tows.SO",
  ST: "strategy.tows.ST",
  WO: "strategy.tows.WO",
  WT: "strategy.tows.WT",
};

export function StrategyReportView() {
  const { t, locale } = useT();
  const navigate = useUiStore((s) => s.navigate);
  const businessId = useUiStore((s) => s.route.businessId);

  const businessQuery = useBusiness(businessId);
  const strategyQuery = useStrategyReport(businessId);

  const isLoading = strategyQuery.isLoading || businessQuery.isLoading;
  const error = strategyQuery.error || businessQuery.error;
  const report = strategyQuery.data;
  const business = businessQuery.data;

  const allStrategies = useMemo<TOWSStrategy[]>(() => {
    if (!report) return [];
    const out: TOWSStrategy[] = [];
    for (const c of TOWS_CATS) {
      out.push(...(report.tows_matrix?.[c] ?? []));
    }
    return out;
  }, [report]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ReportSkeleton />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("strategy.title")}
          subtitle={t("strategy.subtitle")}
          icon={Target}
        />
        <EmptyState
          icon={Target}
          title={t("strategy.empty.title")}
          description={t("strategy.empty.desc")}
          action={{
            label: t("businesses.detail.runPipeline"),
            onClick: () =>
              navigate({
                view: "business-detail",
                businessId,
              }),
          }}
        />
      </div>
    );
  }

  const handleExport = () => {
    try {
      exportReportToPDF({
        title: t("strategy.title"),
        subtitle: business
          ? `${business.name} · ${t("strategy.subtitle")}`
          : t("strategy.subtitle"),
        meta: [
          { label: t("common.reportId"), value: report.report_id },
          { label: t("common.businessType"), value: report.business_type },
          {
            label: t("strategy.posture"),
            value: report.strategic_posture,
          },
          {
            label: t("common.generatedAt"),
            value: formatDate(report.created_at, locale),
          },
        ],
        sections: buildPdfSections(report, t),
      });
      toast.success(t("toast.exported"));
    } catch {
      toast.error(t("toast.error"));
    }
  };

  const meta = [
    {
      label: t("common.reportId"),
      value: report.report_id,
    },
    {
      label: t("common.businessType"),
      value: report.business_type,
    },
    {
      label: t("strategy.posture"),
      value: report.strategic_posture,
    },
    {
      label: t("common.generatedAt"),
      value: formatDate(report.created_at, locale),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <PageHeader
        title={
          business ? `${t("strategy.title")} · ${business.name}` : t("strategy.title")
        }
        subtitle={t("strategy.subtitle")}
        icon={Target}
        meta={meta}
        actions={
          <Button
            variant="outline"
            onClick={handleExport}
            className="rounded-xl gap-1.5"
          >
            <FileDown className="h-4 w-4 rtl:rotate-y-180" />
            {t("common.export")}
          </Button>
        }
      />

      {/* Strategic posture card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="relative overflow-hidden rounded-2xl glass p-5">
          <div className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("strategy.posture")}
              </p>
              <h2 className="mt-0.5 text-xl font-bold gradient-text leading-tight">
                {report.strategic_posture}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {report.posture_rationale}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* TOWS matrix */}
      <section className="space-y-3">
        <SectionHeading icon={Target} text={t("strategy.tows")} />
        <TowsMatrix matrix={report.tows_matrix} />
      </section>

      {/* Tabs: priority / effort×impact / resources / campaigns */}
      <Tabs defaultValue="priority" className="space-y-4">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1 h-auto">
          <TabsTrigger value="priority" className="rounded-lg">
            {t("strategy.priority")}
          </TabsTrigger>
          <TabsTrigger value="effortImpact" className="rounded-lg">
            {t("strategy.effortImpact")}
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-lg">
            {t("strategy.resources")}
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="rounded-lg">
            {t("campaigns.title")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="priority" className="mt-0">
          <Card className="rounded-2xl glass p-4">
            <PriorityRoadmap actions={report.priority_action_plan} />
          </Card>
        </TabsContent>

        <TabsContent value="effortImpact" className="mt-0">
          <EffortImpactScatter
            strategies={allStrategies}
            actions={report.priority_action_plan}
          />
        </TabsContent>

        <TabsContent value="resources" className="mt-0">
          <ResourceAssessment resources={report.resource_assessment} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <CampaignsTab
            feed={report.campaign_brief_feed}
            businessId={businessId}
            onNavigate={() =>
              navigate({ view: "campaigns", businessId })
            }
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function SectionHeading({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
        <Icon className="h-3.5 w-3.5 text-primary-foreground" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{text}</h3>
    </div>
  );
}

function CampaignsTab({
  feed,
  businessId,
  onNavigate,
}: {
  feed: CampaignBrief[];
  businessId: string | undefined;
  onNavigate: () => void;
}) {
  const { t } = useT();

  if (!feed || feed.length === 0) {
    return (
      <Card className="rounded-2xl glass p-4">
        <p className="py-6 text-center text-sm text-muted-foreground">—</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl glass p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <Megaphone className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <h3 className="text-sm font-semibold">{t("campaigns.title")}</h3>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={onNavigate}
          disabled={!businessId}
          className="gap-1.5 rounded-xl"
        >
          {t("strategy.viewCampaigns")}
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
      </div>

      <Separator className="mb-3" />

      <div className="max-h-96 space-y-2 overflow-y-auto pe-1 scroll-area-custom">
        {feed.map((c) => (
          <div
            key={c.feed_id}
            className="rounded-xl border border-border/60 bg-card/60 p-3 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug">
                {c.campaign_angle}
              </p>
              <Badge
                className={cn(
                  "shrink-0 rounded-md text-[10px] font-semibold",
                  confidenceClass(c.confidence),
                )}
              >
                {c.confidence}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/80">
                {t("campaigns.pillar")}:
              </span>{" "}
              {c.messaging_pillar}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="gap-1 rounded-md text-[10px] font-mono text-muted-foreground"
              >
                <Hash className="h-2.5 w-2.5" />
                {c.source_strategy_id}
              </Badge>
              {c.requires_human_approval ? (
                <Badge
                  variant="outline"
                  className="rounded-md text-[10px] font-medium text-amber-600 dark:text-amber-400"
                >
                  {t("campaigns.needsApproval")}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-md text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                >
                  {t("campaigns.autoApproved")}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------- */
/* PDF export helpers                                          */
/* ----------------------------------------------------------- */

type TFunc = ReturnType<typeof useT>["t"];

function buildPdfSections(
  report: StrategyReportEnvelope,
  t: TFunc,
): { heading: string; html: string }[] {
  const sections: { heading: string; html: string }[] = [];

  // Posture
  sections.push({
    heading: t("strategy.posture"),
    html: `
      <h3>${escapeHtml(report.strategic_posture)}</h3>
      <p>${escapeHtml(report.posture_rationale)}</p>
    `,
  });

  // TOWS matrix
  const towsCards = TOWS_CATS.map((cat) => {
    const items = report.tows_matrix?.[cat] ?? [];
    const itemsHtml = items.length
      ? items
          .map(
            (s) => `
          <div class="card">
            <h3>${escapeHtml(s.title)}</h3>
            <p>${escapeHtml(s.description)}</p>
            <div>
              <span class="tag">${escapeHtml(t("strategy.effort"))}: ${s.effort}</span>
              <span class="tag">${escapeHtml(t("strategy.impact"))}: ${s.impact}</span>
              <span class="tag">${escapeHtml(s.time_horizon)}</span>
              <span class="tag">${escapeHtml(t("common.confidence"))}: ${formatPercent(s.confidence)}</span>
            </div>
          </div>`,
          )
          .join("")
      : `<p>—</p>`;
    return `
      <div>
        <h3>${escapeHtml(cat)} — ${escapeHtml(t(TOWS_LABEL_KEYS[cat]))}</h3>
        ${itemsHtml}
      </div>
    `;
  }).join("");

  sections.push({
    heading: t("strategy.tows"),
    html: `<div class="grid">${towsCards}</div>`,
  });

  // Priority plan
  const priorityRows = (report.priority_action_plan ?? [])
    .map(
      (a) => `
      <tr>
        <td><span class="badge b-${a.priority.toLowerCase()}">${escapeHtml(a.priority)}</span></td>
        <td><strong>${escapeHtml(a.title)}</strong><br/><span style="color:#6b7280">${escapeHtml(a.description)}</span></td>
        <td>${escapeHtml(a.owner)}</td>
        <td>${escapeHtml(a.timeframe)}</td>
        <td>${escapeHtml(a.kpi)}</td>
      </tr>`,
    )
    .join("");

  sections.push({
    heading: t("strategy.priority"),
    html: `
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t("strategy.priority.short"))}</th>
            <th>${escapeHtml(t("common.view"))}</th>
            <th>${escapeHtml(t("strategy.owner"))}</th>
            <th>${escapeHtml(t("strategy.timeframe"))}</th>
            <th>${escapeHtml(t("strategy.kpi"))}</th>
          </tr>
        </thead>
        <tbody>${priorityRows}</tbody>
      </table>
    `,
  });

  // Resources
  const totalCost = (report.resource_assessment ?? []).reduce(
    (sum, r) => sum + (r.estimated_cost_usd || 0),
    0,
  );
  const resourceRows = (report.resource_assessment ?? [])
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.resource_type)} — <strong>${escapeHtml(r.name)}</strong></td>
        <td>${escapeHtml(r.current_state)} → ${escapeHtml(r.required_state)}</td>
        <td><span class="badge">${escapeHtml(r.gap)}</span></td>
        <td>${escapeHtml(formatCurrency(r.estimated_cost_usd))}</td>
      </tr>`,
    )
    .join("");

  sections.push({
    heading: t("strategy.resources"),
    html: `
      <p><strong>${escapeHtml(t("strategy.totalCost"))}:</strong> ${escapeHtml(formatCurrency(totalCost))}</p>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t("strategy.resources.type"))}</th>
            <th>${escapeHtml(t("strategy.current"))} → ${escapeHtml(t("strategy.required"))}</th>
            <th>${escapeHtml(t("strategy.resources.gap"))}</th>
            <th>${escapeHtml(t("strategy.resources.cost"))}</th>
          </tr>
        </thead>
        <tbody>${resourceRows}</tbody>
      </table>
    `,
  });

  return sections;
}
