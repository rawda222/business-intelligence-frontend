"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useI18nStore, useT } from "@/lib/i18n/i18n";
import { LanguageSwitcher } from "@/components/dashboard/language-switcher";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const registerSchema = loginSchema.extend({
  full_name: z.string().min(2),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthView() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t, isRTL } = useT();

  const isLogin = mode === "login";
  const form = useForm<RegisterValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) as never,
    defaultValues: { email: "", password: "", full_name: "" },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = isLogin
        ? await authApi.login({ email: values.email, password: values.password })
        : await authApi.register({
            email: values.email,
            password: values.password,
            full_name: values.full_name,
          });
      setAuth(res);
      toast.success(isLogin ? t("toast.loggedIn") : t("toast.registered"), {
        description: t("toast.welcome", { name: res.user.full_name }),
      });
    } catch {
      toast.error(t("toast.loginError"));
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh opacity-70" />
      <div className="absolute end-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/60 shadow-2xl shadow-primary/10 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden gradient-primary p-10 text-primary-foreground lg:flex">
          <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay [background:radial-gradient(circle_at_30%_20%,white,transparent_40%),radial-gradient(circle_at_80%_70%,white,transparent_35%)]" />
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">{t("app.name")}</span>
          </div>
          <div className="relative space-y-5">
            <h2 className="text-3xl font-bold leading-tight">
              {t("app.tagline")}
            </h2>
            <ul className="space-y-3 text-sm text-primary-foreground/90">
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">7</span>
                SWOT Agent v7 — evidence-backed strengths & weaknesses
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">S</span>
                Strategy Agent v1 — TOWS matrix & priority roadmap
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">★</span>
                Campaign brief feed from your strategy
              </li>
            </ul>
          </div>
          <p className="relative text-xs text-primary-foreground/70">
            Powered by Vertex AI · Gemini 2.5 Flash
          </p>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center bg-card p-8 md:p-10">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">{t("app.name")}</span>
            </div>
          </div>

          <div className="mb-6 flex rounded-2xl bg-muted p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="relative flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-xl bg-background shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={mode === m ? "relative z-10 text-foreground" : "relative z-10 text-muted-foreground"}>
                  {m === "login" ? t("auth.signIn") : t("auth.signUp")}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: isRTL ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 8 : -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold">
                {isLogin ? t("auth.welcomeBack") : t("auth.signUpCta")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLogin ? t("auth.signInCta") : t("auth.signUpCta")}
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {!isLogin && (
                  <Field label={t("auth.fullName")} icon={UserIcon} error={errors.full_name?.message}>
                    <Input
                      type="text"
                      autoComplete="name"
                      className="rounded-xl"
                      {...register("full_name")}
                    />
                  </Field>
                )}
                <Field label={t("auth.email")} icon={Mail} error={errors.email?.message}>
                  <Input
                    type="email"
                    autoComplete="email"
                    className="rounded-xl"
                    {...register("email")}
                  />
                </Field>
                <Field label={t("auth.password")} icon={Lock} error={errors.password?.message}>
                  <Input
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="rounded-xl"
                    {...register("password")}
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="me-2 h-4 w-4 rtl:rotate-180" />
                  )}
                  {isLogin ? t("auth.signIn") : t("auth.signUp")}
                </Button>
              </form>

              <Card className="mt-5 rounded-2xl border-dashed bg-muted/30 p-3 text-center text-[11px] text-muted-foreground">
                {t("auth.demoHint")}
              </Card>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
                <button
                  onClick={() => setMode(isLogin ? "register" : "login")}
                  className="font-semibold text-primary hover:underline"
                >
                  {isLogin ? t("auth.signUp") : t("auth.signIn")}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}
