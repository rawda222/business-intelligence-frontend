"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  MessageSquare,
  Grid3x3,
  Target,
  Megaphone,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/i18n";
import { useUiStore } from "@/lib/stores/ui-store";
import { useBusinesses, useCreateBusiness } from "@/lib/hooks/use-businesses";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ListSkeleton } from "@/components/shared/skeletons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { Business, BusinessStatus, CreateBusinessRequest } from "@/types";

const BUSINESS_TYPES = [
  "cafe",
  "restaurant",
  "retail",
  "salon",
  "gym",
  "clinic",
] as const;

const businessTypeKey = (type: string): TranslationKey =>
  `businesses.type.${type}` as TranslationKey;

const STATUS_BADGE: Record<BusinessStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  processing: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  draft: "bg-muted text-muted-foreground border-border",
};

const STATUS_DOT: Record<BusinessStatus, string> = {
  active: "bg-emerald-500",
  processing: "bg-amber-500",
  draft: "bg-muted-foreground/40",
};

const createSchema = z.object({
  name: z.string().min(2).max(80),
  business_type: z.enum(BUSINESS_TYPES),
  description: z.string().max(280).optional(),
  location: z.string().max(120).optional(),
});
type CreateValues = z.infer<typeof createSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function BusinessesView() {
  const { t, locale } = useT();
  const { navigate } = useUiStore();
  const businessesQ = useBusinesses();
  const createMut = useCreateBusiness();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const businesses = businessesQ.data?.businesses ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) =>
      [b.name, b.business_type, b.location ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [businesses, search]);

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      business_type: "cafe",
      description: "",
      location: "",
    },
    mode: "onTouched",
  });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = form;
  const selectedType = useWatch({ control, name: "business_type" });

  const onSubmit = handleSubmit(async (values) => {
    const body: CreateBusinessRequest = {
      name: values.name.trim(),
      business_type: values.business_type,
      description: values.description?.trim() || undefined,
      location: values.location?.trim() || undefined,
    };
    try {
      const created = await createMut.mutateAsync(body);
      toast.success(t("toast.businessCreated"), {
        description: created.name,
      });
      setDialogOpen(false);
      reset();
      navigate({ view: "business-detail", businessId: created.business_id });
    } catch {
      toast.error(t("toast.error"));
    }
  });

  const openDialog = () => {
    reset();
    setDialogOpen(true);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={t("businesses.title")}
          subtitle={t("businesses.subtitle")}
          icon={Building2}
          actions={
            <Button
              onClick={openDialog}
              className="rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4" />
              {t("businesses.new")}
            </Button>
          }
        />
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="rounded-xl bg-background/60 ps-9"
          />
        </div>
      </motion.div>

      {/* List */}
      {businessesQ.isLoading ? (
        <ListSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Building2}
            title={
              search ? t("businesses.empty.title") : t("businesses.empty.title")
            }
            description={
              search
                ? t("businesses.empty.desc")
                : t("businesses.empty.desc")
            }
            action={{
              label: t("businesses.new"),
              onClick: openDialog,
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((b) => (
            <BusinessCard
              key={b.business_id}
              business={b}
              t={t}
              locale={locale}
              onOpen={() =>
                navigate({ view: "business-detail", businessId: b.business_id })
              }
            />
          ))}
        </motion.div>
      )}

      {/* New business dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) reset();
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                <Building2 className="h-4 w-4" />
              </span>
              {t("businesses.new")}
            </DialogTitle>
            <DialogDescription>{t("businesses.subtitle")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label={t("businesses.name")}
              error={errors.name?.message}
              required
            >
              <Input
                className="rounded-xl"
                placeholder={t("businesses.name")}
                {...register("name")}
              />
            </Field>

            <Field
              label={t("businesses.type")}
              error={errors.business_type?.message}
              required
            >
              <Select
                value={selectedType}
                onValueChange={(v) =>
                  setValue("business_type", v as (typeof BUSINESS_TYPES)[number], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((tp) => (
                    <SelectItem key={tp} value={tp}>
                      {t(businessTypeKey(tp))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={t("businesses.description")}
              error={errors.description?.message}
            >
              <Textarea
                rows={3}
                className="resize-none rounded-xl"
                placeholder={t("businesses.description")}
                {...register("description")}
              />
            </Field>

            <Field
              label={t("businesses.location")}
              error={errors.location?.message}
            >
              <Input
                className="rounded-xl"
                placeholder={t("businesses.location")}
                {...register("location")}
              />
            </Field>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setDialogOpen(false)}
                disabled={createMut.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending}
                className="rounded-xl gradient-primary text-primary-foreground"
              >
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function BusinessCard({
  business,
  t,
  locale,
  onOpen,
}: {
  business: Business;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  locale: "en" | "ar";
  onOpen: () => void;
}) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onOpen}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      className="group relative flex flex-col gap-3 rounded-2xl glass p-5 text-start shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Top: name + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold uppercase text-primary">
            {business.name.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">
              {business.name}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {business.business_id}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 gap-1 rounded-full px-2 py-0 text-[10px] font-medium capitalize",
            STATUS_BADGE[business.status],
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              STATUS_DOT[business.status],
            )}
          />
          {business.status}
        </Badge>
      </div>

      {/* Type badge */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant="secondary"
          className="rounded-lg bg-primary/10 text-[10px] font-medium text-primary"
        >
          {t(businessTypeKey(business.business_type))}
        </Badge>
      </div>

      {/* Description */}
      {business.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {business.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {business.location && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{business.location}</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
          {business.review_count.toLocaleString(
            locale === "ar" ? "ar-EG" : "en-US",
          )}
        </span>
      </div>

      {/* Footer: report availability dots */}
      <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex items-center gap-1.5">
          <ReportDot
            icon={Grid3x3}
            available={business.has_swot}
            label="SWOT"
          />
          <ReportDot
            icon={Target}
            available={business.has_strategy}
            label="Strategy"
          />
          <ReportDot
            icon={Megaphone}
            available={business.has_campaigns}
            label="Campaigns"
          />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground transition-colors group-hover:text-primary">
          {t("common.open")} →
        </span>
      </div>
    </motion.button>
  );
}

function ReportDot({
  icon: Icon,
  available,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
  label: string;
}) {
  const dot = (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
        available
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground/50",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{dot}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {label} · {available ? "✓" : "—"}
      </TooltipContent>
    </Tooltip>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}
