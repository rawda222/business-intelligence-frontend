"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useT } from "@/lib/i18n/i18n";
import { quoteSentiment } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Sentiment = "positive" | "negative" | "neutral";

interface SentimentStyle {
  /** Logical left accent bar color (border-s-*). */
  bar: string;
  /** Icon tint. */
  icon: string;
  /** Badge background + text. */
  badge: string;
}

const SENTIMENT_STYLES: Record<Sentiment, SentimentStyle> = {
  positive: {
    bar: "border-s-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  negative: {
    bar: "border-s-rose-500",
    icon: "text-rose-600 dark:text-rose-400",
    badge:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  neutral: {
    bar: "border-s-violet-500",
    icon: "text-violet-600 dark:text-violet-400",
    badge:
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  },
};

const SENTIMENT_LABELS: Record<Sentiment, { en: string; ar: string }> = {
  positive: { en: "Positive", ar: "إيجابي" },
  negative: { en: "Negative", ar: "سلبي" },
  neutral: { en: "Neutral", ar: "محايد" },
};

/**
 * Renders a single real review quote (Arabic + English mixed) with a
 * sentiment-derived accent bar, quote icon, italic text and sentiment badge.
 */
export default function EvidenceQuoteCard({ quote }: { quote: string }) {
  const { locale, isRTL } = useT();
  const sentiment = quoteSentiment(quote);
  const style = SENTIMENT_STYLES[sentiment];
  const label = SENTIMENT_LABELS[sentiment][locale];

  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? -8 : 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl glass p-3.5 ps-4 border-s-2",
        style.bar,
      )}
    >
      <div className="flex items-start gap-2.5">
        <Quote className={cn("mt-0.5 h-4 w-4 shrink-0", style.icon)} />
        <div className="min-w-0 flex-1">
          <p
            dir="auto"
            className="text-sm italic leading-relaxed text-foreground/90"
          >
            {quote}
          </p>
          <div className="mt-2 flex justify-end">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2 py-0 text-[10px] font-medium",
                style.badge,
              )}
            >
              {label}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
