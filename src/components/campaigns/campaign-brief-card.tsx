"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Lightbulb,
  Instagram,
  Music2,
  Mail,
  Linkedin,
  Store,
  MessageCircle,
  Smartphone,
  Truck,
  Search,
  Send,
  Radio,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/i18n";
import type { CampaignBrief } from "@/types";

type Confidence = "high" | "medium" | "low";

const CONFIDENCE_STYLES: Record<
  Confidence,
  { badge: string; dot: string; key: "campaigns.confidence.high" | "campaigns.confidence.medium" | "campaigns.confidence.low" }
> = {
  high: {
    badge:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500",
    key: "campaigns.confidence.high",
  },
  medium: {
    badge:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
    key: "campaigns.confidence.medium",
  },
  low: {
    badge:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    dot: "bg-rose-500",
    key: "campaigns.confidence.low",
  },
};

/** Map a channel string (any case/spacing) to a Lucide icon. */
const CHANNEL_MATCHERS: Array<{ test: RegExp; icon: LucideIcon }> = [
  { test: /instagram/i, icon: Instagram },
  { test: /tiktok|tik tok/i, icon: Music2 },
  { test: /e-?mail|email/i, icon: Mail },
  { test: /linked\s?in/i, icon: Linkedin },
  { test: /in[-\s]?store/i, icon: Store },
  { test: /whatsapp/i, icon: MessageCircle },
  { test: /\bsms\b|text\s?message/i, icon: Smartphone },
  { test: /delivery\s?apps|delivery/i, icon: Truck },
  { test: /google/i, icon: Search },
  { test: /direct/i, icon: Send },
];

function getChannelIcon(channel: string): LucideIcon {
  for (const { test, icon } of CHANNEL_MATCHERS) {
    if (test.test(channel)) return icon;
  }
  return Radio;
}

function parseConfidence(c: string): Confidence {
  const v = c.toLowerCase().trim();
  if (v === "high") return "high";
  if (v === "medium") return "medium";
  if (v === "low") return "low";
  // Fallback heuristic on anything that looks like a fraction/percent.
  const n = Number.parseFloat(v);
  if (!Number.isNaN(n)) {
    if (n >= 0.75 || n >= 75) return "high";
    if (n >= 0.5 || n >= 50) return "medium";
    return "low";
  }
  return "medium";
}

/**
 * CampaignBriefCard — a single AI-generated campaign brief rendered as a
 * glass card with confidence + approval badges, messaging pillar, channel
 * suitability chips and a source-strategy footer.
 */
export default function CampaignBriefCard({
  brief,
}: {
  brief: CampaignBrief;
}) {
  const { t, isRTL } = useT();
  const confidence = parseConfidence(brief.confidence);
  const conf = CONFIDENCE_STYLES[confidence];
  const needsApproval = brief.requires_human_approval;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl glass p-5",
          "transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10",
        )}
      >
        {/* corner accent */}
        <div
          className={cn(
            "pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl opacity-60",
            confidence === "high" && "from-emerald-500/25 to-transparent",
            confidence === "medium" && "from-amber-500/25 to-transparent",
            confidence === "low" && "from-rose-500/25 to-transparent",
          )}
        />

        {/* Top: badges */}
        <div className="relative flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
              conf.badge,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", conf.dot)} />
            {t("common.confidence")}: {t(conf.key)}
          </Badge>

          {needsApproval ? (
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {t("campaigns.needsApproval")}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("campaigns.autoApproved")}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3
          dir={isRTL ? "rtl" : "ltr"}
          className="relative mt-3 text-base font-semibold leading-snug tracking-tight"
        >
          {brief.campaign_angle}
        </h3>

        {/* Subtitle: messaging pillar */}
        <div className="relative mt-2 flex items-start gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          <p className="text-sm italic leading-relaxed text-muted-foreground">
            {brief.messaging_pillar}
          </p>
        </div>

        {/* Channels */}
        <div className="relative mt-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {t("campaigns.channels")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {brief.channel_suitability.map((channel, idx) => {
              const Icon = getChannelIcon(channel);
              return (
                <Badge
                  key={`${channel}-${idx}`}
                  variant="secondary"
                  className="gap-1.5 rounded-lg bg-muted/60 px-2 py-1 text-[11px] font-medium"
                >
                  <Icon className="h-3.5 w-3.5 text-primary/80" />
                  {channel}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Footer: source strategy id */}
        <div className="relative mt-auto flex items-center justify-between gap-2 pt-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <Sparkles className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("campaigns.sourceStrategy")}
            </span>
          </div>
          <code className="truncate rounded-md bg-muted/70 px-2 py-1 font-mono text-[10px] font-semibold text-foreground/80" title={brief.source_strategy_id}>
            {brief.source_strategy_id}
          </code>
        </div>
      </Card>
    </motion.div>
  );
}
