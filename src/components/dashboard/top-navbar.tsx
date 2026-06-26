"use client";

import { Menu, ArrowLeft, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { useUiStore, type ViewName } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useT } from "@/lib/i18n/i18n";
import type { TranslationKey } from "@/lib/i18n/translations";

const VIEW_TITLE: Record<ViewName, TranslationKey> = {
  dashboard: "nav.dashboard",
  businesses: "nav.businesses",
  "business-detail": "nav.businesses",
  upload: "nav.upload",
  swot: "swot.title",
  strategy: "strategy.title",
  campaigns: "campaigns.title",
  history: "nav.history",
  settings: "nav.settings",
};

export function TopNavbar() {
  const { route, setSidebarOpen, back, canGoBack } = useUiStore();
  const { user, clearAuth } = useAuthStore();
  const { t } = useT();

  const title = t(VIEW_TITLE[route.view]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {canGoBack() && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hidden sm:inline-flex"
            onClick={back}
            aria-label="Back"
          >
            <ArrowLeft className="h-[1.1rem] w-[1.1rem]" />
          </Button>
        )}

        <div className="flex min-w-0 items-center gap-1.5 text-sm">
          <span className="text-muted-foreground/70 hidden sm:inline">
            {t("app.name")}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 hidden sm:inline" />
          <span className="truncate font-semibold">{title}</span>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 rounded-xl px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="gradient-primary text-xs font-bold text-primary-foreground">
                    {(user?.full_name ?? "U").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-xs font-medium sm:inline">
                  {user?.full_name ?? "Guest"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{user?.full_name ?? "Guest"}</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {user?.email ?? "—"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => useUiStore.getState().navigate({ view: "settings" })}
              >
                {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => useUiStore.getState().navigate({ view: "history" })}
              >
                {t("nav.history")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={clearAuth}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="me-2 h-4 w-4" />
                {t("settings.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
