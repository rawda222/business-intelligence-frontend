"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  History,
  Megaphone,
  Target,
  Grid3x3,
  Copy,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/i18n";
import { useUiStore, type ViewName } from "@/lib/stores/ui-store";
import { useHistory } from "@/lib/hooks/use-reports";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ListSkeleton } from "@/components/shared/skeletons";
import {
  formatCurrency,
  formatMs,
  formatRelative,
} from "@/lib/utils/format";
import type { HistoryEntry, ReportKind } from "@/types";

const KIND_META: Record<
  ReportKind,
  { icon: LucideIcon; badge: string; labelKey: "swot.title" | "strategy.title" | "campaigns.title" }
> = {
  swot: {
    icon: Grid3x3,
    badge:
      "border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    labelKey: "swot.title",
  },
  strategy: {
    icon: Target,
    badge:
      "border-violet-500/30 bg-violet-500/15 text-violet-600 dark:text-violet-400",
    labelKey: "strategy.title",
  },
  campaigns: {
    icon: Megaphone,
    badge:
      "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400",
    labelKey: "campaigns.title",
  },
};

export function HistoryView() {
  const { t, isRTL, locale } = useT();
  const navigate = useUiStore((s) => s.navigate);
  const { data, isLoading, isError } = useHistory();

  const entries: HistoryEntry[] = data?.entries ?? [];

  // Summary metrics
  const summary = useMemo(() => {
    const totalCost = entries.reduce(
      (sum, e) => sum + (e.cost_estimate_usd ?? 0),
      0,
    );
    const fallbackCount = entries.filter((e) => e.fallback_used).length;
    return {
      total: entries.length,
      totalCost,
      fallbackCount,
    };
  }, [entries]);

  if (isLoading) return <ListSkeleton rows={5} />;

  if (isError || entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={t("history.empty.title")}
        description={t("history.empty.desc")}
        action={{
          label: t("nav.businesses"),
          onClick: () => navigate({ view: "businesses" }),
        }}
      />
    );
  }

  const handleRowClick = (entry: HistoryEntry) => {
    navigate({
      view: entry.kind as ViewName,
      businessId: entry.business_id,
    });
  };

  const handleCopy = async (
    e: React.MouseEvent,
    reportId: string,
  ) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(reportId);
      toast.success(t("common.copied"));
    } catch {
      toast.error(t("toast.error"));
    }
  };

  const summaryCards = [
    {
      label: t("history.summary.total"),
      value: String(summary.total),
      icon: History,
      accent:
        "from-indigo-500/20 to-indigo-500/5 text-indigo-500",
    },
    {
      label: t("history.summary.cost"),
      value: formatCurrency(summary.totalCost),
      icon: Target,
      accent:
        "from-violet-500/20 to-violet-500/5 text-violet-500",
    },
    {
      label: t("history.summary.fallbacks"),
      value: String(summary.fallbackCount),
      icon: AlertTriangle,
      accent:
        summary.fallbackCount > 0
          ? "from-rose-500/20 to-rose-500/5 text-rose-500"
          : "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("history.title")}
        subtitle={t("history.subtitle")}
        icon={History}
      />

      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-3 sm:grid-cols-3"
      >
        {summaryCards.map((s) => (
          <Card
            key={s.label}
            className="relative overflow-hidden rounded-2xl glass p-4"
          >
            <div
              className={cn(
                "absolute -end-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br blur-2xl opacity-70",
                s.accent,
              )}
            />
            <div className="relative flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 text-xl font-bold tracking-tight">
                  {s.value}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                  s.accent,
                )}
              >
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Table (desktop) */}
      <Card className="hidden overflow-hidden rounded-2xl glass md:block">
        <div className="scroll-area-custom max-h-[28rem] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="ps-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.kind")}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.business")}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.reportId")}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.engine")}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.model")}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.fallback")}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.time")}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("common.cost")}
                </TableHead>
                <TableHead className="pe-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t("history.generated")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => {
                const kind = KIND_META[entry.kind];
                const KindIcon = kind.icon;
                return (
                  <motion.tr
                    key={entry.report_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.25 }}
                    onClick={() => handleRowClick(entry)}
                    className={cn(
                      "group cursor-pointer border-border/60 transition-colors",
                      "hover:bg-primary/5",
                    )}
                  >
                    <TableCell className="ps-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          kind.badge,
                        )}
                      >
                        <KindIcon className="h-3.5 w-3.5" />
                        {t(kind.labelKey)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {entry.business_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {entry.business_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <code
                          className="max-w-[10rem] truncate rounded-md bg-muted/60 px-2 py-1 font-mono text-[11px] font-semibold text-foreground/80"
                          title={entry.report_id}
                          dir="ltr"
                        >
                          {entry.report_id}
                        </code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary"
                              onClick={(e) => handleCopy(e, entry.report_id)}
                              aria-label={t("history.copyReportId")}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {t("history.copyReportId")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {entry.engine_version}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {entry.llm_model_used}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      {entry.fallback_used ? (
                        <Badge
                          variant="outline"
                          className="gap-1 rounded-full border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {t("common.on")}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          —
                        </span>
                        )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-[11px] text-muted-foreground">
                        {formatMs(entry.processing_time_ms, locale)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-[11px] font-semibold text-foreground/90">
                        {formatCurrency(entry.cost_estimate_usd)}
                      </span>
                    </TableCell>
                    <TableCell className="pe-4 py-3">
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelative(entry.created_at, locale)}
                      </span>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {entries.map((entry, idx) => {
          const kind = KIND_META[entry.kind];
          const KindIcon = kind.icon;
          return (
            <motion.div
              key={`m-${entry.report_id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.25 }}
              onClick={() => handleRowClick(entry)}
              className="cursor-pointer"
            >
              <Card className="rounded-2xl glass p-4 transition-colors hover:bg-primary/5">
                <div className="flex items-start justify-between gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      kind.badge,
                    )}
                  >
                    <KindIcon className="h-3.5 w-3.5" />
                    {t(kind.labelKey)}
                  </Badge>
                  {entry.fallback_used && (
                    <Badge
                      variant="outline"
                      className="gap-1 rounded-full border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {t("history.fallback")}
                    </Badge>
                  )}
                </div>

                <h3 className="mt-2.5 text-sm font-semibold">
                  {entry.business_name}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {entry.business_type}
                </p>

                <div className="mt-3 flex items-center gap-1.5">
                  <code
                    className="max-w-[12rem] truncate rounded-md bg-muted/60 px-2 py-1 font-mono text-[10px] font-semibold text-foreground/80"
                    title={entry.report_id}
                    dir="ltr"
                  >
                    {entry.report_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary"
                    onClick={(e) => handleCopy(e, entry.report_id)}
                    aria-label={t("history.copyReportId")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div
                  className={cn(
                    "mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-[11px]",
                    isRTL && "text-right",
                  )}
                >
                  <div>
                    <p className="text-muted-foreground">{t("history.engine")}</p>
                    <p className="mt-0.5 font-mono font-semibold">
                      {entry.engine_version}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("history.time")}</p>
                    <p className="mt-0.5 font-semibold">
                      {formatMs(entry.processing_time_ms, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("common.cost")}</p>
                    <p className="mt-0.5 font-semibold">
                      {formatCurrency(entry.cost_estimate_usd)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-[10px] text-muted-foreground">
                  {formatRelative(entry.created_at, locale)}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryView;
