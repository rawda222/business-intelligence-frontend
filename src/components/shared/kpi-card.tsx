"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "indigo" | "violet" | "emerald" | "amber" | "rose";

const ACCENT_MAP: Record<Accent, string> = {
  indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-500",
  violet: "from-violet-500/20 to-violet-500/5 text-violet-500",
  emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-500",
  rose: "from-rose-500/20 to-rose-500/5 text-rose-500",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "indigo",
  trend,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: Accent;
  trend?: { value: string; up: boolean };
  hint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      <Card className="relative overflow-hidden rounded-2xl glass p-5">
        <div
          className={cn(
            "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl",
            ACCENT_MAP[accent],
          )}
        />
        <div className="relative flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
            {trend && (
              <div
                className={cn(
                  "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
                  trend.up ? "text-emerald-500" : "text-rose-500",
                )}
              >
                {trend.up ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {trend.value}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
              ACCENT_MAP[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
