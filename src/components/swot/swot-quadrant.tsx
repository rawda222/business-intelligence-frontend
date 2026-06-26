"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/lib/i18n/i18n";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SWOTItem, SwotQuadrant } from "@/types";
import SwotItemCard from "./swot-item-card";

type QuadrantTitleKey =
  | "swot.strengths"
  | "swot.weaknesses"
  | "swot.opportunities"
  | "swot.threats";

interface QuadrantTheme {
  icon: LucideIcon;
  titleKey: QuadrantTitleKey;
  /** Icon square background tint. */
  iconWrap: string;
  /** Icon glyph tint. */
  iconColor: string;
  /** Logical left accent border color (border-s-*). */
  accent: string;
  /** Count badge classes. */
  countBadge: string;
}

const QUADRANT_THEMES: Record<SwotQuadrant, QuadrantTheme> = {
  strengths: {
    icon: TrendingUp,
    titleKey: "swot.strengths",
    iconWrap: "bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    accent: "border-s-emerald-500/70",
    countBadge:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  weaknesses: {
    icon: TrendingDown,
    titleKey: "swot.weaknesses",
    iconWrap: "bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
    accent: "border-s-rose-500/70",
    countBadge:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  opportunities: {
    icon: Sparkles,
    titleKey: "swot.opportunities",
    iconWrap: "bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
    accent: "border-s-violet-500/70",
    countBadge:
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  },
  threats: {
    icon: AlertTriangle,
    titleKey: "swot.threats",
    iconWrap: "bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    accent: "border-s-amber-500/70",
    countBadge:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
};

/**
 * A SWOT quadrant panel (strengths / weaknesses / opportunities / threats).
 * Renders the quadrant header with a colored icon and item-count badge, then
 * a scrollable vertical stack of `SwotItemCard`s. Empty quadrants render a
 * muted em-dash placeholder.
 */
export default function SwotQuadrant({
  quadrant,
  items,
}: {
  quadrant: SwotQuadrant;
  items: SWOTItem[];
}) {
  const { t } = useT();
  const theme = QUADRANT_THEMES[quadrant];
  const Icon = theme.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl glass border-s-2",
        theme.accent,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              theme.iconWrap,
            )}
          >
            <Icon className={cn("h-4 w-4", theme.iconColor)} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight">
              {t(theme.titleKey)}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("swot.count", { count: items.length })}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 rounded-md text-[10px] font-semibold tabular-nums",
            theme.countBadge,
          )}
        >
          {items.length}
        </Badge>
      </div>

      {/* Body */}
      <div className="scroll-area-custom max-h-[32rem] overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            —
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <SwotItemCard key={item.item_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
