"use client";

import { motion } from "framer-motion";
import { Gauge, CalendarClock, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/i18n";
import type { TranslationKey } from "@/lib/i18n/translations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPercent } from "@/lib/utils/format";
import type {
  StrategyReport,
  TOWSCategory,
  TOWSStrategy,
} from "@/types";

interface CategoryMeta {
  key: TOWSCategory;
  labelKey: TranslationKey;
  /** Tailwind gradient strip */
  gradient: string;
  /** Tailwind text accent for the abbreviation chip */
  chip: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: "SO",
    labelKey: "strategy.tows.SO",
    gradient: "from-emerald-500 to-emerald-600",
    chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "ST",
    labelKey: "strategy.tows.ST",
    gradient: "from-amber-500 to-amber-600",
    chip: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    key: "WO",
    labelKey: "strategy.tows.WO",
    gradient: "from-violet-500 to-violet-600",
    chip: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    key: "WT",
    labelKey: "strategy.tows.WT",
    gradient: "from-rose-500 to-rose-600",
    chip: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
];

/**
 * TOWS Matrix — 4-column responsive grid (SO / ST / WO / WT) of compact
 * strategy cards. Each column header is a colored gradient strip with the
 * abbreviation + full label; each body lists strategies with badges for
 * effort, impact, time horizon and confidence, plus tiny monospace chips
 * for leverages.
 */
export default function TowsMatrix({
  matrix,
}: {
  matrix: StrategyReport["tows_matrix"];
}) {
  const { t } = useT();

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {CATEGORIES.map((cat, idx) => {
        const items = matrix?.[cat.key] ?? [];
        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
          >
            <Card className="overflow-hidden rounded-2xl glass p-0">
              {/* Header strip */}
              <div
                className={`flex items-center gap-2.5 bg-gradient-to-r ${cat.gradient} px-4 py-3 text-white`}
              >
                <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-sm font-bold tracking-tight backdrop-blur-sm">
                  {cat.key}
                </span>
                <span className="text-[11px] font-medium leading-tight text-white/90">
                  {t(cat.labelKey)}
                </span>
              </div>

              {/* Body */}
              <div className="max-h-[28rem] space-y-3 overflow-y-auto p-3 scroll-area-custom">
                {items.length === 0 ? (
                  <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                    —
                  </p>
                ) : (
                  items.map((s) => (
                    <TowsStrategyCard key={s.strategy_id} s={s} />
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function TowsStrategyCard({ s }: { s: TOWSStrategy }) {
  const { t } = useT();

  return (
    <div className="rounded-xl glass p-3 transition-colors hover:border-primary/40">
      <p className="text-sm font-semibold leading-snug">{s.title}</p>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
        {s.description}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="gap-1 rounded-md px-1.5 text-[10px] font-medium"
              >
                <Gauge className="h-3 w-3 text-muted-foreground" />
                {t("strategy.effort")}{" "}
                <span className="font-mono font-semibold">{s.effort}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{t("strategy.effort")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Badge
          variant="secondary"
          className="gap-1 rounded-md px-1.5 text-[10px] font-medium"
        >
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          {t("strategy.impact")}{" "}
          <span className="font-mono font-semibold">{s.impact}</span>
        </Badge>

        <Badge
          variant="secondary"
          className="gap-1 rounded-md px-1.5 text-[10px] font-medium"
        >
          <CalendarClock className="h-3 w-3 text-muted-foreground" />
          {s.time_horizon}
        </Badge>

        <Badge
          variant="secondary"
          className="gap-1 rounded-md px-1.5 text-[10px] font-medium"
        >
          {t("common.confidence")}{" "}
          <span className="font-mono font-semibold">
            {formatPercent(s.confidence)}
          </span>
        </Badge>
      </div>

      {s.leverages && s.leverages.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {s.leverages.map((l) => (
            <code
              key={l}
              className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {l}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}
