"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MetaBadge {
  label: string;
  value: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  meta,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  meta?: MetaBadge[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25">
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {meta && meta.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {meta.map((m) => (
                <Badge
                  key={m.label}
                  variant="outline"
                  className="gap-1.5 rounded-lg bg-muted/40 px-2 py-1 text-[10px] font-medium"
                >
                  <span className="text-muted-foreground">{m.label}:</span>
                  <span className="font-mono font-semibold">{m.value}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
