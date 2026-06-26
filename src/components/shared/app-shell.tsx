"use client";

import type { ReactNode } from "react";
import { SidebarPro } from "@/components/dashboard/sidebar-pro";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Heart, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* ambient gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10 gradient-mesh opacity-60" />

      <div className="flex flex-1">
        <SidebarPro />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { t } = useT();
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row md:px-6 lg:px-8">
        <p className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {t("app.name")} · SWOT Agent v7 + Strategy Agent v1
        </p>
        <p className="flex items-center gap-1.5">
          Vertex AI Gemini 2.5 Flash
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1">
            Built with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> Next.js
          </span>
        </p>
      </div>
    </footer>
  );
}
