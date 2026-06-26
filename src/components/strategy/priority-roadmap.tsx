"use client";

import { motion } from "framer-motion";
import { Target, User, Clock, GitBranch } from "lucide-react";
import { useT } from "@/lib/i18n/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { priorityColorClass } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { PriorityAction, PriorityRank } from "@/types";

const RANK_ORDER: Record<PriorityRank, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

/**
 * Priority Roadmap — vertical timeline of priority actions, sorted by
 * priority rank (P0 → P3) then impact (desc). Each entry has a left rail
 * priority badge (colored via `priorityColorClass`) connected by a vertical
 * line, plus a glass card with the action's meta (owner / timeframe / KPI),
 * two mini effort/impact bars, and dependency chips.
 */
export default function PriorityRoadmap({
  actions,
}: {
  actions: PriorityAction[];
}) {
  const { t, isRTL } = useT();

  const sorted = [...actions].sort((a, b) => {
    const r = RANK_ORDER[a.priority] - RANK_ORDER[b.priority];
    if (r !== 0) return r;
    return b.impact - a.impact;
  });

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">—</p>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((action, idx) => (
        <motion.div
          key={action.action_id}
          initial={{ opacity: 0, x: isRTL ? 14 : -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, delay: idx * 0.05 }}
          className="flex items-stretch gap-3"
        >
          {/* Left rail with priority node + connector */}
          <div className="flex w-12 shrink-0 flex-col items-center">
            <div
              className={cn(
                "mt-3 flex h-10 w-10 items-center justify-center rounded-2xl border bg-card text-xs font-bold",
                priorityColorClass(action.priority),
              )}
            >
              {action.priority}
            </div>
            {idx < sorted.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
            )}
          </div>

          {/* Entry card */}
          <Card className="flex-1 rounded-2xl glass p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                {action.title}
              </h4>
              <Badge
                variant="outline"
                className="shrink-0 gap-1 rounded-md text-[10px] font-medium text-muted-foreground"
              >
                {action.action_id}
              </Badge>
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {action.description}
            </p>

            {/* Meta row */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              <MetaItem icon={User} label={t("strategy.owner")} value={action.owner} />
              <MetaItem icon={Clock} label={t("strategy.timeframe")} value={action.timeframe} />
              <MetaItem icon={Target} label={t("strategy.kpi")} value={action.kpi} />
            </div>

            {/* Mini effort/impact bars */}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <MiniBar
                label={t("strategy.effort")}
                value={action.effort}
                max={10}
                colorClass="bg-amber-500"
              />
              <MiniBar
                label={t("strategy.impact")}
                value={action.impact}
                max={10}
                colorClass="bg-emerald-500"
              />
            </div>

            {/* Dependencies */}
            {action.dependencies && action.dependencies.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <GitBranch className="h-3 w-3 rtl:rotate-y-180" />
                  {t("strategy.dependencies")}
                </span>
                {action.dependencies.map((d) => (
                  <code
                    key={d}
                    className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {d}
                  </code>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
      <span className="text-foreground/70">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

function MiniBar({
  label,
  value,
  max,
  colorClass,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono font-semibold text-foreground/80">
          {value}/{max}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
