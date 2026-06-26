"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileJson, UploadCloud, CheckCircle2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/i18n";

export type UploadStatus = "idle" | "uploading" | "done" | "error";

export function FileUploader({
  status,
  progress,
  fileName,
  fileSize,
  onFile,
  onClear,
  disabled,
}: {
  status: UploadStatus;
  progress: number;
  fileName?: string;
  fileSize?: number;
  onFile: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
}) {
  const { t } = useT();
  const isRTL = useT().isRTL;

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFile(accepted[0]);
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
    multiple: false,
    disabled: disabled || status === "uploading",
  });

  const busy = status === "uploading";

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        data-testid="dropzone"
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-accent/30",
          (disabled || busy) && "pointer-events-none opacity-70",
        )}
      >
        <input {...getInputProps()} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        <motion.div
          animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl",
            isDragActive
              ? "gradient-primary text-primary-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          <UploadCloud className="h-6 w-6" />
        </motion.div>
        <div>
          <p className="text-sm font-semibold">{t("upload.dropzone.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("upload.dropzone.desc")}</p>
        </div>
      </div>

      <AnimatePresence>
        {fileName && status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl glass p-3.5">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  status === "done"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-primary/15 text-primary",
                )}
              >
                {status === "done" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileJson className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{fileName}</p>
                  {fileSize != null && (
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {(fileSize / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
                {busy && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full gradient-primary"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}
                {status === "done" && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {t("upload.uploaded")}
                  </p>
                )}
                {status === "error" && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                    {t("toast.error")}
                  </p>
                )}
              </div>
              {status !== "uploading" && onClear && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear file"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
