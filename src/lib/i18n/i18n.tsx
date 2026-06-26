"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, type ReactNode } from "react";
import {
  getTranslation,
  type Locale,
  type TranslationKey,
} from "./translations";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
      toggle: () => set({ locale: get().locale === "en" ? "ar" : "en" }),
    }),
    {
      name: "bip-i18n",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function isRTL(locale: Locale): boolean {
  return locale === "ar";
}

/** Resolve a translation with optional {var} interpolation. */
export function useT() {
  const locale = useI18nStore((s) => s.locale);
  return {
    locale,
    dir: isRTL(locale) ? "rtl" : "ltr" as const,
    isRTL: isRTL(locale),
    t: (key: TranslationKey, vars?: Record<string, string | number>): string => {
      let str = getTranslation(key, locale);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
  };
}

/** Provider that syncs <html dir/lang> with the active locale. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useI18nStore((s) => s.locale);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = isRTL(locale) ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
