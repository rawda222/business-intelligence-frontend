"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Loader2,
  Circle,
  AlertCircle,
  UploadCloud,
  FileSearch,
  Layers,
  Grid3x3,
  Target,
  Megaphone,
  Database,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PIPELINE_STAGES, type PipelineResult, type PipelineStage } from "@/types";
import { useT } from "@/lib/i18n/i18n";
import type { TranslationKey } from "@/lib/i18n/translations";

const STAGE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  queued: Clock,
  uploading: UploadCloud,
  parsing: FileSearch,
  themes: Layers,
  swot: Grid3x3,
  strategy: Target,
  campaigns: Megaphone,
  mongo: Database,
  done: CheckCircle2,
};

const STAGE_LABEL_KEY: Record<string, TranslationKey> = {
  queued: "pipeline.queued.label",
  uploading: "pipeline.uploading.label",
  parsing: "pipeline.parsing.label",
  themes: "pipeline.themes.label",
  swot: "pipeline.swot.label",
  strategy: "pipeline.strategy.label",
  campaigns: "pipeline.campaigns.label",
  mongo: "pipeline.mongo.label",
  done: "pipeline.done.label",
};

function buildFresh(): PipelineStage[] {
  return PIPELINE_STAGES.map((name) => ({ name, label: name, status: "pending" }));
}

/**
 * Animated 9-stage pipeline tracker. When a new `run` arrives it replays the
 * stages visually (queued → done) so the user sees the agents working, then
 * invokes onComplete so the view can reveal report links.
 */
export function PipelineTracker({
  run,
  onComplete,
}: {
  run: PipelineResult | undefined;
  onComplete?: () => void;
}) {
  const { t } = useT();
  const [stages, setStages] = useState<PipelineStage[]>(buildFresh);
  const [activeIdx, setActiveIdx] = useState(0);
  const completedRef = useRef(false);
  const [prevRunId, setPrevRunId] = useState<string | undefined>(run?.run_id);

  // Reset animation state when the run changes — done during render (the
  // React "adjusting state when a prop changes" pattern) rather than in an
  // effect, to avoid setState-in-effect.
  if (run?.run_id !== prevRunId) {
    setPrevRunId(run?.run_id);
    setStages(buildFresh());
    setActiveIdx(0);
  }

  useEffect(() => {
    if (!run) return;
    completedRef.current = false;

    let i = 0;
    const tick = () => {
      setStages((prev) =>
        prev.map((s, idx) => {
          if (idx < i) return { ...s, status: "completed" as const };
          if (idx === i) return { ...s, status: "running" as const };
          return s;
        }),
      );
      setActiveIdx(i);

      if (i >= PIPELINE_STAGES.length - 1) {
        // finalize
        setTimeout(() => {
          setStages((prev) =>
            prev.map((s) => ({ ...s, status: "completed" as const })),
          );
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        }, 520);
        return;
      }
      i += 1;
      timer = setTimeout(tick, 520);
    };

    let timer = setTimeout(tick, 360);
    return () => clearTimeout(timer);
  }, [run?.run_id, onComplete]);

  const progress = Math.round(
    (stages.filter((s) => s.status === "completed").length / stages.length) * 100,
  );
  const isDone = stages.every((s) => s.status === "completed");

  return (
    <Card className="relative overflow-hidden rounded-2xl glass p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              isDone
                ? "bg-emerald-500/15 text-emerald-500"
                : "bg-primary/15 text-primary",
            )}
          >
            {isDone ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold">
              {isDone ? t("pipeline.completed") : t("pipeline.running")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              run · {run?.run_id?.slice(0, 16) ?? "—"}
            </p>
          </div>
        </div>
        <span className="text-sm font-bold text-primary">{progress}%</span>
      </div>

      {/* progress line */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full gradient-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* stages */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {stages.map((stage, idx) => {
          const Icon = STAGE_ICON[stage.name] ?? Circle;
          const isActive = idx === activeIdx && !isDone;
          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all",
                  stage.status === "completed" &&
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
                  stage.status === "running" &&
                    "border-primary/40 bg-primary/10 text-primary",
                  stage.status === "pending" &&
                    "border-border bg-muted/40 text-muted-foreground/60",
                  stage.status === "failed" &&
                    "border-rose-500/30 bg-rose-500/10 text-rose-500",
                  isActive && "ring-2 ring-primary/40 pulse-ring",
                )}
              >
                {stage.status === "completed" ? (
                  <Check className="h-5 w-5" />
                ) : stage.status === "running" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : stage.status === "failed" ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-tight",
                    stage.status === "pending" && "text-muted-foreground/60",
                  )}
                >
                  {t(STAGE_LABEL_KEY[stage.name])}
                </span>
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[9px] text-primary"
                    >
                      {t("stage.running")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
