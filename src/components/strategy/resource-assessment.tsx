"use client";

import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  Cpu,
  Database,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { useT } from "@/lib/i18n/i18n";
import type { TranslationKey } from "@/lib/i18n/translations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  gapColorClass,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { ResourceGap, ResourceItem } from "@/types";

const TYPE_ICON: Record<
  ResourceItem["resource_type"],
  React.ComponentType<{ className?: string }>
> = {
  human: Users,
  capital: DollarSign,
  technology: Cpu,
  data: Database,
  brand: BadgeCheck,
};

const TYPE_ACCENT: Record<ResourceItem["resource_type"], string> = {
  human: "from-indigo-500/20 to-indigo-500/5 text-indigo-500",
  capital: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
  technology: "from-violet-500/20 to-violet-500/5 text-violet-500",
  data: "from-amber-500/20 to-amber-500/5 text-amber-500",
  brand: "from-rose-500/20 to-rose-500/5 text-rose-500",
};

const TYPE_LABEL_KEY: Record<
  ResourceItem["resource_type"],
  TranslationKey
> = {
  human: "strategy.resourceType.human",
  capital: "strategy.resourceType.capital",
  technology: "strategy.resourceType.technology",
  data: "strategy.resourceType.data",
  brand: "strategy.resourceType.brand",
};

const GAP_LABEL_KEY: Record<ResourceGap, TranslationKey> = {
  low: "strategy.gap.low",
  medium: "strategy.gap.medium",
  high: "strategy.gap.high",
};

/**
 * Resource Assessment — summary header (total estimated cost + count by gap)
 * followed by a responsive grid of resource cards. Each card shows the
 * resource type icon, name, current → required transition with an arrow,
 * gap badge (colored via `gapColorClass`) and estimated cost.
 */
export default function ResourceAssessment({
  resources,
}: {
  resources: ResourceItem[];
}) {
  const { t } = useT();

  const total = (resources ?? []).reduce(
    (sum, r) => sum + (r.estimated_cost_usd || 0),
    0,
  );
  const counts: Record<ResourceGap, number> = { low: 0, medium: 0, high: 0 };
  for (const r of resources ?? []) counts[r.gap]++;

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card className="rounded-2xl glass p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("strategy.totalCost")}
            </p>
            <p className="mt-0.5 text-xl font-bold gradient-text">
              {formatCurrency(total)}
            </p>
          </div>
          <Separator
            orientation="vertical"
            className="hidden h-10 sm:block"
          />
          <div className="flex flex-wrap gap-2.5">
            <GapChip
              count={counts.low}
              label={t("strategy.gap.low")}
              className={gapColorClass("low")}
            />
            <GapChip
              count={counts.medium}
              label={t("strategy.gap.medium")}
              className={gapColorClass("medium")}
            />
            <GapChip
              count={counts.high}
              label={t("strategy.gap.high")}
              className={gapColorClass("high")}
            />
          </div>
        </div>
      </Card>

      {/* Resource cards */}
      {(resources ?? []).length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">—</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {resources.map((r, idx) => (
            <ResourceCard key={r.resource_id} r={r} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

function GapChip({
  count,
  label,
  className,
}: {
  count: number;
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      <span className="font-mono font-bold">{count}</span>
      <span>{label}</span>
    </span>
  );
}

function ResourceCard({ r, idx }: { r: ResourceItem; idx: number }) {
  const { t, isRTL } = useT();
  const Icon = TYPE_ICON[r.resource_type];
  const accent = TYPE_ACCENT[r.resource_type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
    >
      <Card className="h-full rounded-xl glass p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
              accent,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug">{r.name}</p>
              <Badge
                variant="outline"
                className="shrink-0 rounded-md text-[10px] font-medium text-muted-foreground"
              >
                {t(TYPE_LABEL_KEY[r.resource_type])}
              </Badge>
            </div>

            <div className="mt-2 space-y-1.5 text-xs">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {t("strategy.current")}:
                </span>{" "}
                {r.current_state}
              </p>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ArrowRight className="h-3 w-3 shrink-0 rtl:rotate-180" />
                <span>
                  <span className="font-medium text-foreground/80">
                    {t("strategy.required")}:
                  </span>{" "}
                  {r.required_state}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("strategy.resources.gap")}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold",
                gapColorClass(r.gap),
              )}
            >
              {t(GAP_LABEL_KEY[r.gap])}
            </span>
          </div>
          <div className="text-end">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("strategy.resources.cost")}
            </p>
            <p className="font-mono text-sm font-bold">
              {formatCurrency(r.estimated_cost_usd)}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
