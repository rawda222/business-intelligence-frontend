"use client";

import { Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18nStore, useT } from "@/lib/i18n/i18n";
import type { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const { t } = useT();

  const options: { code: Locale; label: string; native: string }[] = [
    { code: "en", label: t("settings.language.en"), native: "English" },
    { code: "ar", label: t("settings.language.ar"), native: "العربية" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl glass gap-2 px-3"
          aria-label="Switch language"
        >
          <Languages className="h-[1.1rem] w-[1.1rem]" />
          <span className="text-xs font-semibold uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl min-w-[9rem]">
        {options.map((o) => (
          <DropdownMenuItem
            key={o.code}
            onClick={() => setLocale(o.code)}
            className="justify-between"
          >
            <span className="flex flex-col">
              <span className="text-sm">{o.native}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </span>
            {locale === o.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
