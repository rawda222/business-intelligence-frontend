"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileJson,
  Loader2,
  ArrowRight,
  Grid3x3,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/i18n";
import { useUiStore } from "@/lib/stores/ui-store";
import { useBusinesses } from "@/lib/hooks/use-businesses";
import { api } from "@/lib/api/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FileUploader,
  type UploadStatus,
} from "@/components/shared/file-uploader";
import { PipelineTracker } from "@/components/shared/pipeline-tracker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PipelineResult } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

export function UploadView() {
  const { t } = useT();
  const { route, navigate } = useUiStore();
  const businessesQ = useBusinesses();

  const presetId = route.businessId;
  const businesses = businessesQ.data?.businesses ?? [];

  const [businessId, setBusinessId] = useState<string | undefined>(presetId);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [pipelineRun, setPipelineRun] = useState<PipelineResult | undefined>(
    undefined,
  );
  const [runAfter, setRunAfter] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pick up a preset businessId when navigating in from business-detail.
  useEffect(() => {
    if (presetId) setBusinessId(presetId);
  }, [presetId]);

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.business_id === businessId),
    [businesses, businessId],
  );

  const reset = () => {
    setFile(undefined);
    setStatus("idle");
    setProgress(0);
    setPipelineRun(undefined);
  };

  const onFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".json")) {
      toast.error(t("upload.invalidType"));
      return;
    }
    setFile(f);
    setStatus("idle");
    setProgress(0);
    setPipelineRun(undefined);
  };

  const onSubmit = async () => {
    if (!businessId || !file) return;
    setSubmitting(true);
    setStatus("uploading");
    setProgress(0);
    setPipelineRun(undefined);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await api.post<PipelineResult>(
        `/businesses/${businessId}/pipeline/upload`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) =>
            setProgress(Math.round((e.loaded / (e.total || 1)) * 100)),
        },
      );
      if (typeof window !== "undefined") localStorage.setItem("lastPipelineResult", JSON.stringify(res.data));
      setStatus("done");
      toast.success(t("toast.uploaded"), {
        description: selectedBusiness?.name,
      });
      if (runAfter) {
        setPipelineRun(res.data);
      }
    } catch {
      setStatus("error");
      toast.error(t("toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || status === "uploading";
  const canSubmit = !!businessId && !!file && !isBusy;
  const showTracker = !!pipelineRun && runAfter;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={t("upload.title")}
          subtitle={t("upload.subtitle")}
          icon={UploadCloud}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 lg:grid-cols-3">
        {/* Uploader column */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl glass p-5 md:p-6">
            {/* Business selector */}
            <div className="mb-5 space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileJson className="h-3.5 w-3.5" />
                {t("upload.selectBusiness")}
              </Label>
              <Select
                value={businessId}
                onValueChange={(v) => setBusinessId(v)}
                disabled={isBusy || businessesQ.isLoading}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue
                    placeholder={
                      businessesQ.isLoading
                        ? t("common.loading")
                        : t("upload.selectBusiness")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.business_id} value={b.business_id}>
                      <span className="flex items-center gap-2">
                        <span className="truncate">{b.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          · {b.review_count.toLocaleString()} {t("businesses.reviews").toLowerCase()}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBusiness && (
                <p className="pt-1 text-[11px] text-muted-foreground">
                  {selectedBusiness.location ?? "—"} · {selectedBusiness.business_type}
                </p>
              )}
            </div>

            {/* File uploader */}
            <FileUploader
              status={status}
              progress={progress}
              fileName={file?.name}
              fileSize={file?.size}
              onFile={onFile}
              onClear={reset}
              disabled={!businessId || isBusy}
            />

            {/* Run-after toggle */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t("upload.runAfter")}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t("pipeline.title")} · SWOT Agent + Strategy Agent
                </p>
              </div>
              <Switch
                checked={runAfter}
                onCheckedChange={setRunAfter}
                disabled={isBusy}
              />
            </div>

            {/* Submit */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-muted-foreground">
                {file
                  ? `${file.name} · ${(file.size / 1024).toFixed(1)} KB`
                  : t("upload.dropzone.desc")}
              </p>
              <Button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/25 sm:min-w-44"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("upload.uploading")} {progress}%
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    {t("upload.submit")}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Side info */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl glass p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">{t("upload.title")}</p>
            </div>
            <ol className="space-y-3 text-xs text-muted-foreground">
              <Step n={1}>{t("upload.selectBusiness")}</Step>
              <Step n={2}>{t("upload.dropzone.title")}</Step>
              <Step n={3}>{t("upload.submit")}</Step>
              <Step n={4}>{t("pipeline.title")}</Step>
            </ol>
            <div className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/20 p-3">
              <p className="text-[11px] font-medium text-foreground">
                SWOT Agent · Strategy Agent
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Vertex AI · Gemini 2.5 Flash
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Pipeline tracker */}
      {showTracker && (
        <motion.div variants={itemVariants}>
          <PipelineTracker
            run={pipelineRun}
            onComplete={() => toast.success(t("toast.pipelineDone"))}
          />
        </motion.div>
      )}

      {/* Post-completion report links */}
      {showTracker && status === "done" && (
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl glass p-5 md:p-6">
            <p className="mb-3 text-sm font-semibold">
              {t("toast.pipelineDone")}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button
                onClick={() =>
                  navigate({ view: "swot", businessId: businessId! })
                }
                className="rounded-xl"
              >
                <Grid3x3 className="h-4 w-4" />
                {t("pipeline.viewSwot")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate({ view: "strategy", businessId: businessId! })
                }
                className="rounded-xl"
              >
                <Target className="h-4 w-4" />
                {t("pipeline.viewStrategy")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Error / empty state fallbacks */}
      {!businessesQ.isLoading && businesses.length === 0 && (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={UploadCloud}
            title={t("businesses.empty.title")}
            description={t("businesses.empty.desc")}
            action={{
              label: t("businesses.new"),
              onClick: () => navigate({ view: "businesses" }),
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary",
        )}
      >
        {n}
      </span>
      <span className="pt-0.5 leading-relaxed">{children}</span>
    </li>
  );
}
