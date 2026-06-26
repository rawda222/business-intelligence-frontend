"use client";

import { useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Languages,
  User as UserIcon,
  LogOut,
  Cpu,
  Brain,
  Bot,
  Server,
  Info,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useT, useI18nStore } from "@/lib/i18n/i18n";
import { useAuthStore } from "@/lib/stores/auth-store";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils/format";
import type { Locale, TranslationKey } from "@/lib/i18n/translations";
import type { User } from "@/types";

/* ------------------------------------------------------------------ */
/* Reusable section shell                                              */
/* ------------------------------------------------------------------ */

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  index,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  index: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4), ease: "easeOut" }}
    >
      <Card className="rounded-2xl glass p-5 md:p-6">
        <header className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/25">
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </header>
        {children}
      </Card>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Theme picker                                                        */
/* ------------------------------------------------------------------ */

const emptySubscribe = () => () => {};
/** SSR-safe "is client" flag without setState-in-effect (next-themes hydration guard). */
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const { t } = useT();
  const mounted = useIsClient();

  const options: Array<{
    value: "light" | "dark" | "system";
    label: string;
    icon: LucideIcon;
  }> = [
    { value: "light", label: t("settings.theme.light"), icon: Sun },
    { value: "dark", label: t("settings.theme.dark"), icon: Moon },
    { value: "system", label: t("settings.theme.system"), icon: Monitor },
  ];

  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      {options.map((opt) => {
        const active = mounted && theme === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={active}
            className={cn(
              "group relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 text-start transition-all",
              active
                ? "border-transparent gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "border-border/70 bg-muted/40 hover:border-primary/40 hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-white/15 text-primary-foreground"
                  : "bg-muted text-foreground/80 group-hover:text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{opt.label}</span>
            {active && (
              <ShieldCheck className="ms-auto h-4 w-4 text-primary-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Language picker                                                     */
/* ------------------------------------------------------------------ */

function LanguagePicker() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const { t } = useT();

  const options: Array<{
    code: Locale;
    native: string;
    label: string;
    flag: string;
  }> = [
    { code: "en", native: "English", label: t("settings.language.en"), flag: "EN" },
    { code: "ar", native: "العربية", label: t("settings.language.ar"), flag: "AR" },
  ];

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((opt) => {
        const active = locale === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLocale(opt.code)}
            aria-pressed={active}
            className={cn(
              "group relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 text-start transition-all",
              active
                ? "border-transparent gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "border-border/70 bg-muted/40 hover:border-primary/40 hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold uppercase transition-colors",
                active
                  ? "bg-white/15 text-primary-foreground"
                  : "bg-muted text-foreground/80 group-hover:text-primary",
              )}
              dir="ltr"
            >
              {opt.flag}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold" dir={opt.code === "ar" ? "rtl" : "ltr"}>
                {opt.native}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  active ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {opt.label}
              </span>
            </span>
            {active && (
              <ShieldCheck className="ms-auto h-4 w-4 text-primary-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Account card                                                        */
/* ------------------------------------------------------------------ */

function roleLabel(role: User["role"]): TranslationKey {
  switch (role) {
    case "owner":
      return "settings.account.role.owner";
    case "analyst":
      return "settings.account.role.analyst";
    case "viewer":
      return "settings.account.role.viewer";
  }
}

function AccountCard() {
  const { t, locale, isRTL } = useT();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}
      </div>
    );
  }

  const initial = (user.full_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16 shrink-0 rounded-2xl gradient-primary">
          <AvatarFallback className="rounded-2xl gradient-primary text-xl font-bold text-primary-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">
            {user.full_name}
          </h3>
          <p className="truncate text-sm text-muted-foreground" dir="ltr">
            {user.email}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-violet-500/30 bg-violet-500/15 px-2.5 py-1 text-[11px] font-semibold capitalize text-violet-600 dark:text-violet-400"
            >
              <UserIcon className="h-3 w-3" />
              {t(roleLabel(user.role))}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {t("settings.account.memberSince")}: {formatDate(user.created_at, locale)}
            </Badge>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3",
          isRTL && "flex-row-reverse text-right",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-500">
            <LogOut className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {t("settings.signOut")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t("toast.loggedOut")}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="rounded-lg"
          onClick={() => {
            clearAuth();
            toast.success(t("toast.loggedOut"));
          }}
        >
          <LogOut className="me-1.5 h-4 w-4" />
          {t("settings.signOut")}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI Engine info                                                      */
/* ------------------------------------------------------------------ */

function EngineCard() {
  const { t } = useT();

  const items: Array<{
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
    accent: string;
  }> = [
    {
      icon: Cpu,
      label: t("settings.engine.provider"),
      value: "vertex_ai",
      accent: "from-indigo-500/20 to-indigo-500/5 text-indigo-500",
    },
    {
      icon: Brain,
      label: t("settings.engine.model"),
      value: "gemini-2.5-flash",
      accent: "from-violet-500/20 to-violet-500/5 text-violet-500",
    },
    {
      icon: Bot,
      label: t("settings.engine.agents"),
      value: "SWOT Agent v7 · Strategy Agent v1",
      accent: "from-amber-500/20 to-amber-500/5 text-amber-500",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-4"
        >
          <div
            className={cn(
              "absolute -end-3 -top-3 h-12 w-12 rounded-full bg-gradient-to-br blur-xl opacity-70",
              item.accent,
            )}
          />
          <div className="relative">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br",
                item.accent,
              )}
            >
              <item.icon className="h-4 w-4" />
            </div>
            <p className="mt-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p
              className="mt-0.5 break-words font-mono text-xs font-semibold text-foreground/90"
              dir="ltr"
            >
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Backend connection                                                  */
/* ------------------------------------------------------------------ */

function BackendCard() {
  const { t } = useT();
  const [realMode, setRealMode] = useState(false);

  const apiUrl = realMode
    ? "http://localhost:8000/api/v1"
    : "/api/v1";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("settings.backend.url")}
          </p>
          <code
            className="mt-1 block break-all font-mono text-sm font-semibold text-foreground/90"
            dir="ltr"
          >
            {apiUrl}
          </code>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "w-fit gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            realMode
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              realMode ? "bg-emerald-500" : "bg-amber-500",
            )}
          />
          {realMode ? "Real" : "Mock"}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Server className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{t("settings.backend.realMode")}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t("common.off")} → {t("common.on")} · USE_REAL_BACKEND
            </p>
          </div>
        </div>
        <Switch
          checked={realMode}
          onCheckedChange={setRealMode}
          aria-label={t("settings.backend.realMode")}
        />
      </div>

      {realMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t("settings.backend.note")}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main view                                                           */
/* ------------------------------------------------------------------ */

export function SettingsView() {
  const { t } = useT();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        icon={Settings}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsSection
          index={0}
          icon={Sun}
          title={t("settings.appearance")}
          description={t("settings.theme")}
        >
          <ThemePicker />
        </SettingsSection>

        <SettingsSection
          index={1}
          icon={Languages}
          title={t("settings.language")}
          description={t("settings.language.en")}
        >
          <LanguagePicker />
        </SettingsSection>

        <SettingsSection
          index={2}
          icon={UserIcon}
          title={t("settings.account")}
          description={t("settings.account.role")}
        >
          <AccountCard />
        </SettingsSection>

        <SettingsSection
          index={3}
          icon={Cpu}
          title={t("settings.engine")}
          description={t("settings.engine.agents")}
        >
          <EngineCard />
        </SettingsSection>

        <SettingsSection
          index={4}
          icon={Server}
          title={t("settings.backend")}
          description={t("settings.backend.url")}
        >
          <BackendCard />
        </SettingsSection>
      </div>
    </div>
  );
}

export default SettingsView;
