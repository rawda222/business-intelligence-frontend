"use client";

import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  MessageSquare,
  DollarSign,
  LayoutDashboard,
  Plus,
  UploadCloud,
  PlayCircle,
  MapPin,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useT } from "@/lib/i18n/i18n";
import { useUiStore } from "@/lib/stores/ui-store";
import { useBusinesses } from "@/lib/hooks/use-businesses";
import { useHistory } from "@/lib/hooks/use-reports";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ListSkeleton } from "@/components/shared/skeletons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { HistoryEntry, ReportKind } from "@/types";
import type { TranslationKey } from "@/lib/i18n/translations";

const businessTypeKey = (type: string): TranslationKey =>
  `businesses.type.${type}` as TranslationKey;


const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  processing: "bg-amber-500",
  draft: "bg-muted-foreground/50",
};

const KIND_BADGE: Record<ReportKind, string> = {
  swot: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  strategy:
    "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  campaigns:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

export function DashboardView() {
  const { t, locale, isRTL } = useT();
  const { navigate } = useUiStore();
  const businessesQ = useBusinesses();
  const historyQ = useHistory();

  const businesses = businessesQ.data?.businesses ?? [];
  const history = Array.isArray(historyQ.data)
  ? historyQ.data 
  : ((historyQ.data as any)?.entries ?? (historyQ.data as any)?.items ?? []);

  const reportsCount = history.length;
  const reviewsAnalyzed = businesses.reduce(
    (sum, b) => sum + (b.review_count ?? 0),
    0,
  );
  const spend = history.reduce(
    (sum, h) => sum + (h.cost_estimate_usd ?? 0),
    0,
  );

  const chartData = (() => {
    if (history.length === 0) return [] as { label: string; swot: number; strategy: number; campaigns: number; total: number }[];
    const byDay = new Map<string, { swot: number; strategy: number; campaigns: number }>();
    for (const h of history) {
      const d = new Date(h.created_at);
      const key = d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
      });
      const entry = byDay.get(key) ?? { swot: 0, strategy: 0, campaigns: 0 };
      entry[h.kind] += 1;
      byDay.set(key, entry);
    }
    return Array.from(byDay.entries())
      .map(([label, v]) => ({ label, ...v, total: v.swot + v.strategy + v.campaigns }))
      .slice(-12);
  })();

  const recentBusinesses = businesses.slice(0, 4);
  const recentReports = history.slice(0, 5);

  const isLoading = businessesQ.isLoading || historyQ.isLoading;

  if (!isLoading && businesses.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <PageHeader
            title={t("dashboard.title")}
            subtitle={t("dashboard.subtitle")}
            icon={LayoutDashboard}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Building2}
            title={t("dashboard.empty.title")}
            description={t("dashboard.empty.desc")}
            action={{
              label: t("dashboard.action.newBusiness"),
              onClick: () => navigate({ view: "businesses" }),
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={t("dashboard.title")}
          subtitle={t("dashboard.subtitle")}
          icon={LayoutDashboard}
        />
      </motion.div>

      {/* KPI row */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl glass p-5">
              <Skeleton className="mb-3 h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </Card>
          ))
        ) : (
          <>
            <KpiCard
              label={t("dashboard.kpi.businesses")}
              value={businesses.length}
              icon={Building2}
              accent="indigo"
              trend={{ value: `${businesses.length} total`, up: true }}
            />
            <KpiCard
              label={t("dashboard.kpi.reports")}
              value={reportsCount}
              icon={FileText}
              accent="violet"
              trend={{ value: `${reportsCount} generated`, up: true }}
            />
            <KpiCard
              label={t("dashboard.kpi.reviews")}
              value={reviewsAnalyzed.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
              icon={MessageSquare}
              accent="emerald"
              hint={t("common.evidence")}
            />
            <KpiCard
              label={t("dashboard.kpi.spend")}
              value={formatCurrency(spend)}
              icon={DollarSign}
              accent="amber"
              hint="Vertex AI · Gemini 2.5 Flash"
            />
          </>
        )}
      </motion.div>

      {/* Chart + Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="rounded-2xl glass p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {t("dashboard.pipelineActivity")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {reportsCount} {t("dashboard.kpi.reports").toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-64 w-full" dir="ltr">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-56 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      reversed={isRTL}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      width={36}
                      orientation={isRTL ? "right" : "left"}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        fontSize: 12,
                        color: "hsl(var(--popover-foreground))",
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name={t("dashboard.kpi.reports")}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      fill="url(#dashArea)"
                      dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl glass p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">{t("dashboard.quickActions")}</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <QuickAction
                icon={Building2}
                label={t("dashboard.action.newBusiness")}
                onClick={() => navigate({ view: "businesses" })}
                accent="indigo"
              />
              <QuickAction
                icon={UploadCloud}
                label={t("dashboard.action.uploadReviews")}
                onClick={() => navigate({ view: "upload" })}
                accent="violet"
              />
              <QuickAction
                icon={PlayCircle}
                label={t("dashboard.action.runPipeline")}
                onClick={() => navigate({ view: "businesses" })}
                accent="emerald"
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent businesses + reports */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl glass p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">
                {t("dashboard.recentBusinesses")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={() => navigate({ view: "businesses" })}
              >
                {t("common.view")}
                <ArrowUpRight className="h-3.5 w-3.5 rtl:rotate-90" />
              </Button>
            </div>
            {isLoading ? (
              <ListSkeleton rows={3} />
            ) : recentBusinesses.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("dashboard.empty.title")}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {recentBusinesses.map((b) => (
                  <li key={b.business_id}>
                    <button
                      onClick={() =>
                        navigate({ view: "business-detail", businessId: b.business_id })
                      }
                      className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-muted/30 p-3 text-start transition-all hover:border-primary/30 hover:bg-accent/40"
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase",
                          "bg-primary/10 text-primary",
                        )}
                      >
                        {b.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{b.name}</p>
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              STATUS_DOT[b.status],
                            )}
                            title={b.status}
                          />
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[10px] font-medium"
                          >
                            {t(businessTypeKey(b.business_type))}
                          </Badge>
                          {b.location && (
                            <span className="flex items-center gap-0.5 truncate">
                              <MapPin className="h-3 w-3" />
                              {b.location}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="h-3 w-3" />
                            {b.review_count.toLocaleString(
                              locale === "ar" ? "ar-EG" : "en-US",
                            )}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:text-primary rtl:rotate-90" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl glass p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">
                {t("dashboard.recentReports")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={() => navigate({ view: "history" })}
              >
                {t("common.view")}
                <ArrowUpRight className="h-3.5 w-3.5 rtl:rotate-90" />
              </Button>
            </div>
            {isLoading ? (
              <ListSkeleton rows={4} />
            ) : recentReports.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("history.empty.title")}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {recentReports.map((r: HistoryEntry) => (
                  <li key={r.report_id}>
                    <button
                      onClick={() =>
                        navigate({
                          view: r.kind,
                          businessId: r.business_id,
                        })
                      }
                      className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-muted/30 p-3 text-start transition-all hover:border-primary/30 hover:bg-accent/40"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-bold uppercase",
                          KIND_BADGE[r.kind],
                        )}
                      >
                        {r.kind.slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {r.business_name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {t(businessTypeKey(r.business_type))}
                          {" · "}
                          {formatRelative(r.created_at, locale)}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatCurrency(r.cost_estimate_usd)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  accent: "indigo" | "violet" | "emerald";
}) {
  const accentClass =
    accent === "indigo"
      ? "bg-indigo-500/15 text-indigo-500"
      : accent === "violet"
        ? "bg-violet-500/15 text-violet-500"
        : "bg-emerald-500/15 text-emerald-500";
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 text-start transition-all hover:border-primary/40 hover:bg-accent/40"
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          accentClass,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary rtl:rotate-90" />
    </motion.button>
  );
}
