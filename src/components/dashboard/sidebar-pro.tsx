"use client";

import {
  LayoutDashboard,
  Building2,
  UploadCloud,
  History,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUiStore, type ViewName } from "@/lib/stores/ui-store";
import { useT } from "@/lib/i18n/i18n";
import { useAuthStore } from "@/lib/stores/auth-store";

interface NavItem {
  view: ViewName;
  labelKey: Parameters<ReturnType<typeof useT>["t"]>[0];
  icon: React.ComponentType<{ className?: string }>;
  section: "workspace" | "system";
}

const NAV_ITEMS: NavItem[] = [
  { view: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, section: "workspace" },
  { view: "businesses", labelKey: "nav.businesses", icon: Building2, section: "workspace" },
  { view: "upload", labelKey: "nav.upload", icon: UploadCloud, section: "workspace" },
  { view: "history", labelKey: "nav.history", icon: History, section: "workspace" },
  { view: "settings", labelKey: "nav.settings", icon: Settings, section: "system" },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { route, navigate } = useUiStore();
  const { t } = useT();
  const user = useAuthStore((s) => s.user);

  const workspace = NAV_ITEMS.filter((i) => i.section === "workspace");
  const system = NAV_ITEMS.filter((i) => i.section === "system");

  const renderItem = (item: NavItem) => {
    const active = route.view === item.view;
    const Icon = item.icon;
    return (
      <button
        key={item.view}
        onClick={() => {
          navigate({ view: item.view });
          onNavigate?.();
        }}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
        )}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-xl gradient-primary shadow-lg shadow-primary/25"
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}
        <Icon className="relative z-10 h-[1.15rem] w-[1.15rem] shrink-0" />
        <span className="relative z-10 truncate">{t(item.labelKey)}</span>
      </button>
    );
  };

  return (
    <nav className="flex flex-col gap-1 px-3">
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {t("nav.section.workspace")}
      </p>
      {workspace.map(renderItem)}

      <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {t("nav.section.system")}
      </p>
      {system.map(renderItem)}
    </nav>
  );
}

function Brand() {
  const { navigate } = useUiStore();
  const { t } = useT();
  return (
    <button
      onClick={() => navigate({ view: "dashboard" })}
      className="flex items-center gap-2.5 px-5 py-5"
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/30">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-ring" />
      </div>
      <div className="flex flex-col text-start leading-tight">
        <span className="text-sm font-bold tracking-tight">{t("app.name")}</span>
        <span className="text-[10px] text-muted-foreground">{t("app.tagline")}</span>
      </div>
    </button>
  );
}

export function SidebarPro() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const user = useAuthStore((s) => s.user);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto scroll-area-custom py-2">
          <NavList />
        </div>
        <AgentFooter user={user} />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="start" className="w-72 border-sidebar-border bg-sidebar p-0">
          <SheetHeader className="px-0">
            <div className="flex items-center justify-between pe-4">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SheetTitle className="sr-only">{`Navigation`}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto scroll-area-custom py-2">
            <NavList onNavigate={() => setSidebarOpen(false)} />
          </div>
          <AgentFooter user={user} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function AgentFooter({ user }: { user: { full_name: string; email: string } | null }) {
  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="rounded-2xl glass p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
            {(user?.full_name ?? "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">
              {user?.full_name ?? "Guest user"}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {user?.email ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Gemini 2.5 Flash · Agents online
          </span>
        </div>
      </div>
    </div>
  );
}
