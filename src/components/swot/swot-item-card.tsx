"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, MessageSquareText } from "lucide-react";
import { useT } from "@/lib/i18n/i18n";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  formatPercent,
  scoreBarClass,
  scoreColorClass,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { SWOTItem } from "@/types";
import EvidenceQuoteCard from "./evidence-quote-card";

/**
 * A single SWOT finding: title, frequency + source_theme tags, reasoning,
 * animated scoring bars (importance / impact / confidence) and a collapsible
 * stack of real evidence quote cards.
 */
export default function SwotItemCard({ item }: { item: SWOTItem }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  const scores: { label: string; value: number }[] = [
    { label: t("swot.importance"), value: item.scoring.importance },
    { label: t("swot.impact"), value: item.scoring.impact },
    { label: t("common.confidence"), value: item.scoring.confidence },
  ];

  const hasEvidence = item.evidence_refs.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-2xl glass p-4"
    >
      {/* Header row: title + frequency + source theme */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4
          dir="auto"
          className="min-w-0 flex-1 text-sm font-semibold leading-snug pe-2"
        >
          {item.title}
        </h4>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            className="rounded-md text-[10px] font-medium"
          >
            {item.frequency} {t("businesses.reviews")}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-md bg-muted/40 font-mono text-[10px] text-muted-foreground"
          >
            {item.source_theme}
          </Badge>
        </div>
      </div>

      {/* Reasoning */}
      <p
        dir="auto"
        className="mt-2 text-sm leading-relaxed text-muted-foreground"
      >
        {item.reasoning}
      </p>

      {/* Scoring bars */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {scores.map((s) => (
          <div key={s.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                {s.label}
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold tabular-nums",
                  scoreColorClass(s.value),
                )}
              >
                {formatPercent(s.value)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, s.value * 100))}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn("h-full rounded-full", scoreBarClass(s.value))}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Evidence quotes (collapsible) */}
      {hasEvidence && (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquareText className="h-3.5 w-3.5" />
                {t("swot.evidenceQuotes")} ({item.evidence_refs.length})
              </span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-4 w-4 items-center justify-center"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2.5 space-y-2">
              {item.evidence_refs.map((q, idx) => (
                <EvidenceQuoteCard key={idx} quote={q} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </motion.article>
  );
}
